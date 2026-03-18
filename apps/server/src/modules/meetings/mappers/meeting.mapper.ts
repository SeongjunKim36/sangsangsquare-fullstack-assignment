import { Injectable } from "@nestjs/common";
import { Meeting, Application, ApplicationStatus } from "../../../entity";

@Injectable()
export class MeetingMapper {
  toListResponse(meeting: Meeting) {
    return {
      id: meeting.id,
      type: meeting.type,
      title: meeting.title,
      description: meeting.description,
      capacity: meeting.capacity,
      announcementAt: meeting.announcementAt.toISOString(),
    };
  }

  toUserListResponse(
    meeting: Meeting,
    canApply: boolean,
    myApplicationStatus: ApplicationStatus | null
  ) {
    return {
      ...this.toListResponse(meeting),
      canApply,
      myApplicationStatus,
    };
  }

  toDetailResponse(meeting: Meeting) {
    return {
      id: meeting.id,
      type: meeting.type,
      title: meeting.title,
      description: meeting.description,
      capacity: meeting.capacity,
      announcementAt: meeting.announcementAt.toISOString(),
    };
  }

  toUserDetailResponse(
    meeting: Meeting,
    canApply: boolean,
    myApplicationStatus: ApplicationStatus | null,
    myApplication: Application | null,
    userName?: string
  ) {
    return {
      ...this.toDetailResponse(meeting),
      canApply,
      myApplicationStatus,
      myApplication: myApplication
        ? {
            applicationId: myApplication.id,
            userName: userName || myApplication.user?.name,
            status: myApplicationStatus ?? ApplicationStatus.PENDING,
            appliedAt: myApplication.createdAt.toISOString(),
          }
        : null,
    };
  }

  toAdminResponse(meeting: Meeting) {
    return {
      id: meeting.id,
      type: meeting.type,
      title: meeting.title,
      description: meeting.description,
      capacity: meeting.capacity,
      announcementAt: meeting.announcementAt.toISOString(),
      createdAt: meeting.createdAt.toISOString(),
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
