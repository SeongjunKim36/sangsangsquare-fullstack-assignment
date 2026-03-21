import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThan, QueryFailedError, Repository } from "typeorm";
import { Meeting, Application, ApplicationStatus } from "../../entity";
import { MeetingMapper } from "./mappers/meeting.mapper";
import { getCurrentServerTime, isAnnouncementPassed } from "../../util";

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private readonly meetingMapper: MeetingMapper
  ) {}

  async findAll(userId: number | null = null) {
    const now = getCurrentServerTime();
    const meetings = await this.meetingRepository.find({
      where: { announcementAt: MoreThan(now) },
      order: { createdAt: "DESC" },
    });
    const applicantCounts = await this.getApplicantCountMap(meetings.map((meeting) => meeting.id));
    const myApplicationsMap = userId
      ? await this.getMyApplicationsMapByUserId(userId)
      : new Map<number, Application>();

    return meetings.map((meeting) => {
      const myApplication = myApplicationsMap.get(meeting.id);
      const isPassed = isAnnouncementPassed(meeting.announcementAt);
      const canApply = !isPassed && !myApplication;
      const myApplicationStatus = this.getApplicationStatus(myApplication, isPassed);
      const applicantCount = applicantCounts.get(meeting.id) || 0;

      return this.meetingMapper.toListResponse(
        meeting,
        applicantCount,
        canApply,
        myApplicationStatus,
        isPassed
      );
    });
  }

  async findOne(meetingId: number, userId: number | null = null) {
    const meeting = await this.meetingRepository.findOne({
      where: { id: meetingId },
    });

    if (!meeting) {
      throw new NotFoundException("모임을 찾을 수 없습니다.");
    }

    const myApplication = userId
      ? await this.applicationRepository.findOne({
          where: { meetingId, userId },
          relations: ["user"],
        })
      : null;

    const isPassed = isAnnouncementPassed(meeting.announcementAt);
    const canApply = !isPassed && !myApplication;
    const myApplicationStatus = this.getApplicationStatus(myApplication, isPassed);
    const applicantCount = await this.applicationRepository.count({
      where: { meetingId },
    });

    return this.meetingMapper.toDetailResponse(
      meeting,
      applicantCount,
      canApply,
      myApplicationStatus,
      isPassed,
      myApplication,
      myApplication?.user.name
    );
  }

  async applyToMeeting(meetingId: number, userId: number, userName: string) {
    const meeting = await this.meetingRepository.findOne({
      where: { id: meetingId },
    });

    if (!meeting) {
      throw new NotFoundException("모임을 찾을 수 없습니다.");
    }

    if (isAnnouncementPassed(meeting.announcementAt)) {
      throw new BadRequestException("발표일이 지난 모임에는 신청할 수 없습니다.");
    }

    const application = this.applicationRepository.create({
      meetingId,
      userId,
      status: ApplicationStatus.PENDING,
    });

    try {
      await this.applicationRepository.save(application);
    } catch (error) {
      if (this.isDuplicateApplicationError(error)) {
        throw new ConflictException("이미 신청한 모임입니다.");
      }
      throw error;
    }

    return {
      success: true,
      message: "모임 신청이 완료되었습니다.",
      applicationId: application.id,
      application: {
        applicationId: application.id,
        applicantName: userName,
        status: application.status,
        appliedAt: application.createdAt.toISOString(),
      },
    };
  }

  async getMyApplications(userId: number) {
    const applications = await this.applicationRepository.find({
      where: { userId },
      relations: ["meeting"],
      order: { createdAt: "DESC" },
    });

    return applications.map((app) => {
      const isPassed = isAnnouncementPassed(app.meeting.announcementAt);
      const visibleStatus =
        isPassed || app.status === ApplicationStatus.PENDING
          ? app.status
          : ApplicationStatus.PENDING;

      return this.meetingMapper.toMyApplicationResponse(app, visibleStatus, isPassed);
    });
  }

  private getApplicationStatus(
    application: Application | null | undefined,
    isAnnouncementPassed: boolean
  ): ApplicationStatus | null {
    if (!application) return null;
    return isAnnouncementPassed || application.status === ApplicationStatus.PENDING
      ? application.status
      : null;
  }

  private async getMyApplicationsMapByUserId(userId: number): Promise<Map<number, Application>> {
    const myApplications = await this.applicationRepository.find({
      where: { userId },
      select: ["id", "meetingId", "userId", "status", "createdAt"],
    });

    return new Map(myApplications.map((app) => [app.meetingId, app]));
  }

  private async getApplicantCountMap(meetingIds: number[]): Promise<Map<number, number>> {
    if (meetingIds.length === 0) {
      return new Map();
    }

    const rows = await this.applicationRepository
      .createQueryBuilder("application")
      .select("application.meetingId", "meetingId")
      .addSelect("COUNT(*)", "applicantCount")
      .where("application.meetingId IN (:...meetingIds)", { meetingIds })
      .groupBy("application.meetingId")
      .getRawMany<{ meetingId: string; applicantCount: string }>();

    return new Map(rows.map((row) => [Number(row.meetingId), Number(row.applicantCount)]));
  }

  private isDuplicateApplicationError(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError = error.driverError as { code?: string } | undefined;
    return (
      driverError?.code === "SQLITE_CONSTRAINT" || driverError?.code === "SQLITE_CONSTRAINT_UNIQUE"
    );
  }
}
