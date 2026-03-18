/**
 * 개발용 Mock 데이터
 * 실제 백엔드 API가 준비되면 이 파일은 삭제됩니다.
 */

import {
  MeetingType,
  ApplicationStatus,
  MeetingListItem,
  MeetingDetail,
  MyApplication,
} from "./types";

// 로컬 스토리지 키
const STORAGE_KEY_VIEWER = "ssq-viewer-id";
const STORAGE_KEY_VIEWER_NAME = "ssq-viewer-name";

// ViewerId 가져오기/생성
export function getViewerId(): string {
  if (typeof window === "undefined") return "viewer-" + Date.now();

  let viewerId = localStorage.getItem(STORAGE_KEY_VIEWER);
  if (!viewerId) {
    viewerId = "viewer-" + crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY_VIEWER, viewerId);
  }
  return viewerId;
}

// Mock 데이터: 모임 목록
export const mockMeetings: MeetingListItem[] = [
  {
    id: 1,
    type: MeetingType.BOOK,
    title: "3월 독서 모임 - 소설 읽기",
    description:
      "매주 한 권씩 소설을 읽고 토론하는 모임입니다. 함께 책을 읽으며 생각을 나눠요.",
    capacity: 10,
    announcementAt: "2026-03-20T12:00:00.000Z",
    applicantCount: 14,
    canApply: true,
    myApplicationStatus: null,
  },
  {
    id: 2,
    type: MeetingType.EXERCISE,
    title: "아침 러닝 크루",
    description: "매일 아침 7시, 한강에서 5km 러닝을 함께 합니다.",
    capacity: 15,
    announcementAt: "2026-03-25T09:00:00.000Z",
    applicantCount: 8,
    canApply: true,
    myApplicationStatus: null,
  },
  {
    id: 3,
    type: MeetingType.RECORD,
    title: "일기 쓰기 챌린지",
    description: "매일 저녁 30분씩 일기를 쓰고 공유하는 모임입니다.",
    capacity: 20,
    announcementAt: "2026-04-01T18:00:00.000Z",
    applicantCount: 12,
    canApply: true,
    myApplicationStatus: null,
  },
  {
    id: 4,
    type: MeetingType.ENGLISH,
    title: "영어 회화 스터디",
    description: "주 3회 영어로만 대화하는 화상 모임입니다.",
    capacity: 8,
    announcementAt: "2026-03-30T10:00:00.000Z",
    applicantCount: 10,
    canApply: false,
    myApplicationStatus: null,
  },
];

// API Mock 함수들
export async function fetchMeetingDetail(
  meetingId: number
): Promise<MeetingDetail | null> {
  // 실제로는 API 호출
  await new Promise((resolve) => setTimeout(resolve, 500));

  const meeting = mockMeetings.find((m) => m.id === meetingId);
  if (!meeting) return null;

  return {
    ...meeting,
    myApplication: null,
  };
}

export async function applyToMeeting(
  meetingId: number,
  userName: string
): Promise<{ success: boolean; message: string }> {
  // 실제로는 API 호출
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock 성공 응답
  return {
    success: true,
    message: "모임 신청이 완료되었습니다!",
  };
}

export async function fetchMyApplications(): Promise<MyApplication[]> {
  // 실제로는 API 호출
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock 데이터
  return [
    {
      applicationId: 1,
      meetingId: 1,
      meetingType: MeetingType.BOOK,
      meetingTitle: "3월 독서 모임 - 소설 읽기",
      capacity: 10,
      announcementAt: "2026-03-20T12:00:00.000Z",
      status: ApplicationStatus.PENDING,
      appliedAt: "2026-03-14T03:00:00.000Z",
    },
  ];
}
