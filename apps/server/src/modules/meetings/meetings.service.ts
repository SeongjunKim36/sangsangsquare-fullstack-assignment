import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import { Meeting, Application, ApplicationStatus } from "../../entity";
import { MeetingMapper } from "./mappers/meeting.mapper";
import { isAnnouncementPassed } from "../../util";

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private readonly meetingMapper: MeetingMapper
  ) {}

  async findAllForUser(userId: number) {
    const meetings = await this.meetingRepository.find({
      relations: ["applications"],
      order: { createdAt: "DESC" },
    });

    const myApplicationsMap = await this.getMyApplicationsMapByUserId(userId);

    return meetings.map((meeting) => {
      const myApplication = myApplicationsMap.get(meeting.id);
      const isPassed = isAnnouncementPassed(meeting.announcementAt);
      const canApply = !isPassed && !myApplication;
      const myApplicationStatus = this.getApplicationStatus(myApplication, isPassed);
      const applicantCount = meeting.applications?.length || 0;

      return this.meetingMapper.toListResponse(
        meeting,
        applicantCount,
        canApply,
        myApplicationStatus
      );
    });
  }

  async findOneForUser(meetingId: number, userId: number) {
    const meeting = await this.meetingRepository.findOne({
      where: { id: meetingId },
      relations: ["applications"],
    });

    if (!meeting) {
      throw new NotFoundException("모임을 찾을 수 없습니다.");
    }

    const myApplication = await this.applicationRepository.findOne({
      where: { meetingId, userId },
      relations: ["user"],
    });

    const isPassed = isAnnouncementPassed(meeting.announcementAt);
    const canApply = !isPassed && !myApplication;
    const myApplicationStatus = this.getApplicationStatus(myApplication, isPassed);
    const applicantCount = meeting.applications?.length || 0;

    return this.meetingMapper.toDetailResponse(
      meeting,
      applicantCount,
      canApply,
      myApplicationStatus,
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

      return this.meetingMapper.toMyApplicationResponse(app, visibleStatus);
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
