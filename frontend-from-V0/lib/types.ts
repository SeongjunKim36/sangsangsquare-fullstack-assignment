// 모임 유형 enum
export enum MeetingType {
  BOOK = "BOOK",
  EXERCISE = "EXERCISE",
  RECORD = "RECORD",
  ENGLISH = "ENGLISH",
}

// 신청 상태 enum
export enum ApplicationStatus {
  PENDING = "PENDING",
  SELECTED = "SELECTED",
  REJECTED = "REJECTED",
}

// 모임 목록 아이템 타입
export interface MeetingListItem {
  id: number;
  type: MeetingType;
  title: string;
  description: string | null;
  capacity: number;
  announcementAt: string; // "2026-03-20T12:00:00.000Z"
  applicantCount: number;
  canApply: boolean;
  myApplicationStatus: ApplicationStatus | null;
}

// 모임 상세 타입
export interface MeetingDetail extends MeetingListItem {
  myApplication: {
    id: number;
    applicantName: string;
    status: ApplicationStatus;
    appliedAt: string;
  } | null;
}

// 내 신청 정보 타입
export interface MyApplication {
  applicationId: number;
  meetingId: number;
  meetingType: MeetingType;
  meetingTitle: string;
  announcementAt: string;
  status: ApplicationStatus;
  appliedAt: string;
}

// 관리자 페이지용 타입
export interface CreateMeetingForm {
  type: MeetingType;
  title: string;
  description: string;
  capacity: number;
  announcementAt: string;
}

export interface AdminMeetingItem {
  id: number;
  type: MeetingType;
  title: string;
  capacity: number;
  announcementAt: string;
  applicantCount: number;
  selectedCount: number;
  rejectedCount: number;
  pendingCount: number;
}

export interface Applicant {
  id: number;
  applicantId: string;
  applicantName: string;
  status: ApplicationStatus;
  appliedAt: string;
}
