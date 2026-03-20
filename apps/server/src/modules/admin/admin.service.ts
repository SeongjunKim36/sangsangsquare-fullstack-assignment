import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Meeting, Application, ApplicationStatus, MeetingCategory } from "../../entity";
import { CreateMeetingDto, UpdateApplicationStatusDto } from "../../dto";
import { MeetingMapper } from "../meetings/mappers/meeting.mapper";
import { getCurrentServerTime } from "../../util";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    @InjectRepository(MeetingCategory)
    private readonly categoryRepository: Repository<MeetingCategory>,
    private readonly dataSource: DataSource,
    private readonly meetingMapper: MeetingMapper
  ) {}

  /**
   * 모임 생성
   */
  async createMeeting(dto: CreateMeetingDto) {
    // Find category by key
    const category = await this.categoryRepository.findOne({
      where: { key: dto.type, isActive: true },
    });

    if (!category) {
      throw new BadRequestException(`유효하지 않은 모임 종류입니다: ${dto.type}`);
    }

    const announcementAt = new Date(dto.announcementAt);
    if (announcementAt <= getCurrentServerTime()) {
      throw new BadRequestException("발표일은 현재 시각 이후여야 합니다.");
    }

    const meeting = this.meetingRepository.create({
      categoryId: category.id,
      title: dto.title,
      description: dto.description || null,
      capacity: dto.capacity,
      announcementAt,
    });

    await this.meetingRepository.save(meeting);

    return {
      success: true,
      message: "모임이 생성되었습니다.",
      meetingId: meeting.id,
    };
  }

  /**
   * 관리자 모임 목록 조회
   */
  async findAllMeetings() {
    const meetings = await this.meetingRepository.find({
      order: { createdAt: "DESC" },
    });
    const statsMap = await this.getMeetingStatsMap(meetings.map((meeting) => meeting.id));

    return meetings.map((meeting) => {
      const stats = statsMap.get(meeting.id) || {
        applicantCount: 0,
        selectedCount: 0,
        rejectedCount: 0,
        pendingCount: 0,
      };

      return this.meetingMapper.toAdminResponse(
        meeting,
        stats.applicantCount,
        stats.selectedCount,
        stats.rejectedCount,
        stats.pendingCount,
        getCurrentServerTime() >= meeting.announcementAt
      );
    });
  }

  /**
   * 모임 상세 조회 (관리자용)
   */
  async findOneMeeting(meetingId: number) {
    const meeting = await this.meetingRepository.findOne({
      where: { id: meetingId },
    });

    if (!meeting) {
      throw new NotFoundException("모임을 찾을 수 없습니다.");
    }

    const stats = await this.getMeetingStats(meetingId);

    return this.meetingMapper.toAdminResponse(
      meeting,
      stats.applicantCount,
      stats.selectedCount,
      stats.rejectedCount,
      stats.pendingCount,
      getCurrentServerTime() >= meeting.announcementAt
    );
  }

  /**
   * 신청자 목록 조회
   */
  async findApplications(meetingId: number) {
    const meeting = await this.meetingRepository.findOne({
      where: { id: meetingId },
    });

    if (!meeting) {
      throw new NotFoundException("모임을 찾을 수 없습니다.");
    }

    const applications = await this.applicationRepository.find({
      where: { meetingId },
      relations: ["user"],
      order: { createdAt: "ASC" },
    });

    return applications.map((app) => ({
      applicationId: app.id,
      meetingId: app.meetingId,
      userId: app.user.userId,
      applicantName: app.user.name,
      status: app.status,
      appliedAt: app.createdAt.toISOString(),
    }));
  }

  /**
   * 신청자 상태 변경 (선정/탈락)
   */
  async updateApplicationStatus(
    meetingId: number,
    applicationId: number,
    dto: UpdateApplicationStatusDto
  ) {
    return await this.dataSource.transaction("SERIALIZABLE", async (manager) => {
      const application = await manager.findOne(Application, {
        where: { id: applicationId, meetingId },
        relations: ["meeting"],
      });

      if (!application) {
        throw new NotFoundException("신청을 찾을 수 없습니다.");
      }

      const now = getCurrentServerTime();
      const announcementAt = new Date(application.meeting.announcementAt);

      if (now < announcementAt) {
        throw new BadRequestException("발표일 이전에는 선정/탈락 처리를 할 수 없습니다.");
      }

      if (application.status !== ApplicationStatus.PENDING) {
        throw new BadRequestException("이미 처리된 신청입니다. PENDING 상태만 변경할 수 있습니다.");
      }

      if (dto.status === ApplicationStatus.SELECTED) {
        const selectedCount = await manager.count(Application, {
          where: {
            meetingId: application.meetingId,
            status: ApplicationStatus.SELECTED,
          },
        });

        if (selectedCount >= application.meeting.capacity) {
          throw new BadRequestException(
            `모집 정원(${application.meeting.capacity}명)이 이미 초과되었습니다.`
          );
        }
      }

      application.status = dto.status;
      await manager.save(Application, application);

      return {
        success: true,
        message:
          dto.status === ApplicationStatus.SELECTED
            ? "선정 처리되었습니다."
            : "탈락 처리되었습니다.",
        applicationId: application.id,
        status: application.status,
      };
    });
  }

  private async getMeetingStatsMap(meetingIds: number[]): Promise<
    Map<
      number,
      {
        applicantCount: number;
        selectedCount: number;
        rejectedCount: number;
        pendingCount: number;
      }
    >
  > {
    if (meetingIds.length === 0) {
      return new Map();
    }

    const rows = await this.applicationRepository
      .createQueryBuilder("application")
      .select("application.meetingId", "meetingId")
      .addSelect("COUNT(*)", "applicantCount")
      .addSelect(
        "SUM(CASE WHEN application.status = :selectedStatus THEN 1 ELSE 0 END)",
        "selectedCount"
      )
      .addSelect(
        "SUM(CASE WHEN application.status = :rejectedStatus THEN 1 ELSE 0 END)",
        "rejectedCount"
      )
      .addSelect(
        "SUM(CASE WHEN application.status = :pendingStatus THEN 1 ELSE 0 END)",
        "pendingCount"
      )
      .where("application.meetingId IN (:...meetingIds)", { meetingIds })
      .groupBy("application.meetingId")
      .setParameters({
        selectedStatus: ApplicationStatus.SELECTED,
        rejectedStatus: ApplicationStatus.REJECTED,
        pendingStatus: ApplicationStatus.PENDING,
      })
      .getRawMany<{
        meetingId: string;
        applicantCount: string;
        selectedCount: string;
        rejectedCount: string;
        pendingCount: string;
      }>();

    return new Map(
      rows.map((row) => [
        Number(row.meetingId),
        {
          applicantCount: Number(row.applicantCount),
          selectedCount: Number(row.selectedCount),
          rejectedCount: Number(row.rejectedCount),
          pendingCount: Number(row.pendingCount),
        },
      ])
    );
  }

  private async getMeetingStats(meetingId: number) {
    const statsMap = await this.getMeetingStatsMap([meetingId]);
    return (
      statsMap.get(meetingId) || {
        applicantCount: 0,
        selectedCount: 0,
        rejectedCount: 0,
        pendingCount: 0,
      }
    );
  }
}
