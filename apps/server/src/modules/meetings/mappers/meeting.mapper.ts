import { Injectable } from "@nestjs/common";
import { Meeting, Application, ApplicationStatus, MeetingType } from "../../../entity";

@Injectable()
export class MeetingMapper {
  private getMeetingType(meeting: Meeting): MeetingType {
    return meeting.category.key as MeetingType;
  }

  toListResponse(
    meeting: Meeting,
    applicantCount: number,
    canApply: boolean,
    myApplicationStatus: ApplicationStatus | null,
    announcementPassed: boolean
  ) {
    return {
      id: meeting.id,
      type: this.getMeetingType(meeting),
      title: meeting.title,
      description: meeting.description,
      capacity: meeting.capacity,
      announcementAt: meeting.announcementAt.toISOString(),
      applicantCount,
      canApply,
      myApplicationStatus,
      announcementPassed,
    };
  }

  toDetailResponse(
    meeting: Meeting,
    applicantCount: number,
    canApply: boolean,
    myApplicationStatus: ApplicationStatus | null,
    announcementPassed: boolean,
    myApplication: Application | null,
    userName?: string
  ) {
    return {
      ...this.toListResponse(
        meeting,
        applicantCount,
        canApply,
        myApplicationStatus,
        announcementPassed
      ),
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
    pendingCount: number,
    announcementPassed: boolean
  ) {
    return {
      id: meeting.id,
      type: this.getMeetingType(meeting),
      title: meeting.title,
      description: meeting.description,
      capacity: meeting.capacity,
      announcementAt: meeting.announcementAt.toISOString(),
      createdAt: meeting.createdAt.toISOString(),
      applicantCount,
      selectedCount,
      rejectedCount,
      pendingCount,
      announcementPassed,
    };
  }

  toMyApplicationResponse(
    application: Application,
    visibleStatus: ApplicationStatus,
    announcementPassed: boolean
  ) {
    return {
      applicationId: application.id,
      meetingId: application.meeting.id,
      meetingType: this.getMeetingType(application.meeting),
      meetingTitle: application.meeting.title,
      capacity: application.meeting.capacity,
      announcementAt: application.meeting.announcementAt.toISOString(),
      announcementPassed,
      status: visibleStatus,
      appliedAt: application.createdAt.toISOString(),
    };
  }
}
