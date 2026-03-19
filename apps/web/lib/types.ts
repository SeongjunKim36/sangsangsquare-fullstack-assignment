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

export type UserRole = "USER" | "ADMIN";

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

export interface MeetingApplicationSummary {
  applicationId: number;
  applicantName: string;
  status: ApplicationStatus;
  appliedAt: string;
}

// 모임 상세 타입
export interface MeetingDetail extends MeetingListItem {
  myApplication: MeetingApplicationSummary | null;
}

// 내 신청 정보 타입
export interface MyApplication {
  applicationId: number;
  meetingId: number;
  meetingType: MeetingType;
  meetingTitle: string;
  capacity: number;
  announcementAt: string;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface CurrentUser {
  id: number;
  userId: string;
  name: string;
  role: UserRole;
}

export interface LoginForm {
  userId: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: CurrentUser;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
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
  description: string | null;
  capacity: number;
  announcementAt: string;
  applicantCount: number;
  selectedCount: number;
  rejectedCount: number;
  pendingCount: number;
  createdAt: string;
}

export interface Applicant {
  applicationId: number;
  meetingId: number;
  userId: string;
  applicantName: string;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface CreateMeetingResponse {
  success: boolean;
  message: string;
  meetingId: number;
}

export interface UpdateApplicationStatusResponse {
  success: boolean;
  message: string;
  applicationId: number;
  status: ApplicationStatus;
}
