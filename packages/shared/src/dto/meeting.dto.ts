import { MeetingType, ApplicationStatus } from "../types/meeting";

export interface CreateMeetingDto {
  type: MeetingType;
  title: string;
  description?: string;
  capacity: number;
  announcementAt: string;
}

export interface ApplyToMeetingDto {
  applicantId: string;
  applicantName: string;
}

export interface UpdateApplicationStatusDto {
  status: ApplicationStatus;
}
