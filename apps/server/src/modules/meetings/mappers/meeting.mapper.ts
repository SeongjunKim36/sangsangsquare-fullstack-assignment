import { Injectable } from "@nestjs/common";
import { Meeting, Application, ApplicationStatus } from "../../../entity";

@Injectable()
export class MeetingMapper {
  toListResponse(
    meeting: Meeting,
    applicantCount: number,
    canApply: boolean,
    myApplicationStatus: ApplicationStatus | null
  ) {
    return {
      id: meeting.id,
      type: meeting.type,
      title: meeting.title,
      description: meeting.description,
      capacity: meeting.capacity,
      announcementAt: meeting.announcementAt.toISOString(),
      applicantCount,
      canApply,
      myApplicationStatus,
    };
  }

  toDetailResponse(
    meeting: Meeting,
    applicantCount: number,
    canApply: boolean,
    myApplicationStatus: ApplicationStatus | null,
    myApplication: Application | null,
    userName?: string
  ) {
    return {
      ...this.toListResponse(meeting, applicantCount, canApply, myApplicationStatus),
      myApplication: myApplication
        ? {
            applicationId: myApplication.id,
            applicantName: userName || myApplication.user?.name,
            status: myApplicationStatus ?? ApplicationStatus.PENDING,
            appliedAt: myApplication.createdAt.toISOString(),
          }
        : null,
    };
  }

  toAdminResponse(
    meeting: Meeting,
    applicantCount: number,
    selectedCount: number,
    rejectedCount: number,
    pendingCount: number
  ) {
    return {
      id: meeting.id,
      type: meeting.type,
      title: meeting.title,
      description: meeting.description,
      capacity: meeting.capacity,
      announcementAt: meeting.announcementAt.toISOString(),
      createdAt: meeting.createdAt.toISOString(),
      applicantCount,
      selectedCount,
      rejectedCount,
      pendingCount,
    };
  }

  toMyApplicationResponse(application: Application, visibleStatus: ApplicationStatus) {
    return {
      applicationId: application.id,
      meetingId: application.meeting.id,
      meetingType: application.meeting.type,
      meetingTitle: application.meeting.title,
      capacity: application.meeting.capacity,
      announcementAt: application.meeting.announcementAt.toISOString(),
      status: visibleStatus,
      appliedAt: application.createdAt.toISOString(),
    };
  }
}
