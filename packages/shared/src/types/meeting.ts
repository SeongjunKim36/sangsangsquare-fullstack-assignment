export enum MeetingType {
  BOOK = "BOOK",
  EXERCISE = "EXERCISE",
  RECORD = "RECORD",
  ENGLISH = "ENGLISH",
}

export interface Meeting {
  id: number;
  type: MeetingType;
  title: string;
  description: string | null;
  capacity: number;
  announcementAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingWithStats extends Meeting {
  applicantCount: number;
  selectedCount: number;
  rejectedCount: number;
  pendingCount: number;
}

export interface MeetingDetail extends Meeting {
  myApplication?: {
    id: number;
    status: ApplicationStatus;
    createdAt: string;
  };
}

export enum ApplicationStatus {
  PENDING = "PENDING",
  SELECTED = "SELECTED",
  REJECTED = "REJECTED",
}
