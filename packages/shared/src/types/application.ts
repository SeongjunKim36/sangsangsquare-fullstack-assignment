import { ApplicationStatus } from "./meeting";

export interface Application {
  id: number;
  meetingId: number;
  applicantId: string;
  applicantName: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationWithMeeting extends Application {
  meeting: {
    id: number;
    type: string;
    title: string;
    capacity: number;
    announcementAt: string;
  };
}

export interface ApplicationStatistics {
  applicantCount: number;
  selectedCount: number;
  rejectedCount: number;
  pendingCount: number;
}
