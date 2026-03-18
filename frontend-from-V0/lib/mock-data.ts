import {
  MeetingType,
  ApplicationStatus,
  MeetingListItem,
  MeetingDetail,
  MyApplication,
} from "./types";

// Mock 모임 목록 데이터
export const mockMeetings: MeetingListItem[] = [
  {
    id: 1,
    type: MeetingType.BOOK,
    title: "3월 독서 모임 - 소설 읽기",
    description:
      "매주 한 권씩 소설을 읽고 토론하는 모임입니다. 함께 책을 읽으며 생각을 나눠요. 다양한 장르의 소설을 통해 서로의 관점을 공유합니다.",
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
    description:
      "매일 아침 7시, 한강에서 5km 러닝을 함께 합니다. 건강한 습관을 만들어가요.",
    capacity: 15,
    announcementAt: "2026-03-25T09:00:00.000Z",
    applicantCount: 8,
    canApply: false,
    myApplicationStatus: ApplicationStatus.PENDING,
  },
  {
    id: 3,
    type: MeetingType.RECORD,
    title: "일상 기록 모임",
    description:
      "매일 짧은 글로 일상을 기록하는 습관을 만들어요. 서로의 기록을 공유하며 동기부여를 받습니다.",
    capacity: 20,
    announcementAt: "2026-03-18T18:00:00.000Z",
    applicantCount: 22,
    canApply: true,
    myApplicationStatus: null,
  },
  {
    id: 4,
    type: MeetingType.ENGLISH,
    title: "영어 스터디 - 비즈니스 영어",
    description:
      "실무에서 사용하는 비즈니스 영어를 함께 공부합니다. 이메일 작성, 미팅 영어 등을 다룹니다.",
    capacity: 8,
    announcementAt: "2026-03-22T10:00:00.000Z",
    applicantCount: 12,
    canApply: false,
    myApplicationStatus: ApplicationStatus.SELECTED,
  },
  {
    id: 5,
    type: MeetingType.BOOK,
    title: "4월 독서 모임 - 에세이",
    description:
      "에세이를 읽고 서로의 이야기를 나누는 모임입니다. 따뜻한 글들을 함께 읽어요.",
    capacity: 12,
    announcementAt: "2026-04-15T12:00:00.000Z",
    applicantCount: 5,
    canApply: true,
    myApplicationStatus: null,
  },
  {
    id: 6,
    type: MeetingType.EXERCISE,
    title: "주말 등산 모임",
    description:
      "매주 토요일 아침, 서울 근교 산을 함께 등반합니다. 초보자도 환영!",
    capacity: 10,
    announcementAt: "2026-03-15T08:00:00.000Z",
    applicantCount: 10,
    canApply: false,
    myApplicationStatus: ApplicationStatus.REJECTED,
  },
];

// Mock 모임 상세 데이터
export const mockMeetingDetails: Record<number, MeetingDetail> = {
  1: {
    ...mockMeetings[0],
    myApplication: null,
  },
  2: {
    ...mockMeetings[1],
    myApplication: {
      id: 101,
      applicantName: "김철수",
      status: ApplicationStatus.PENDING,
      appliedAt: "2026-03-10T14:30:00.000Z",
    },
  },
  3: {
    ...mockMeetings[2],
    myApplication: null,
  },
  4: {
    ...mockMeetings[3],
    myApplication: {
      id: 102,
      applicantName: "김철수",
      status: ApplicationStatus.SELECTED,
      appliedAt: "2026-03-08T09:15:00.000Z",
    },
  },
  5: {
    ...mockMeetings[4],
    myApplication: null,
  },
  6: {
    ...mockMeetings[5],
    myApplication: {
      id: 103,
      applicantName: "김철수",
      status: ApplicationStatus.REJECTED,
      appliedAt: "2026-03-01T11:00:00.000Z",
    },
  },
};

// Mock 내 신청 목록 데이터
export const mockMyApplications: MyApplication[] = [
  {
    applicationId: 101,
    meetingId: 2,
    meetingType: MeetingType.EXERCISE,
    meetingTitle: "아침 러닝 크루",
    announcementAt: "2026-03-25T09:00:00.000Z",
    status: ApplicationStatus.PENDING,
    appliedAt: "2026-03-10T14:30:00.000Z",
  },
  {
    applicationId: 102,
    meetingId: 4,
    meetingType: MeetingType.ENGLISH,
    meetingTitle: "영어 스터디 - 비즈니스 영어",
    announcementAt: "2026-03-22T10:00:00.000Z",
    status: ApplicationStatus.SELECTED,
    appliedAt: "2026-03-08T09:15:00.000Z",
  },
  {
    applicationId: 103,
    meetingId: 6,
    meetingType: MeetingType.EXERCISE,
    meetingTitle: "주말 등산 모임",
    announcementAt: "2026-03-15T08:00:00.000Z",
    status: ApplicationStatus.REJECTED,
    appliedAt: "2026-03-01T11:00:00.000Z",
  },
];

// 데이터 fetching 시뮬레이션 함수들
export async function fetchMeetings(): Promise<MeetingListItem[]> {
  // API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 800));
  return mockMeetings;
}

export async function fetchMeetingDetail(
  id: number
): Promise<MeetingDetail | null> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return mockMeetingDetails[id] || null;
}

export async function fetchMyApplications(): Promise<MyApplication[]> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return mockMyApplications;
}

export async function applyToMeeting(
  meetingId: number,
  applicantName: string
): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // 간단한 검증
  if (!applicantName.trim()) {
    return { success: false, message: "이름을 입력해주세요." };
  }

  const meeting = mockMeetings.find((m) => m.id === meetingId);
  if (!meeting) {
    return { success: false, message: "모임을 찾을 수 없습니다." };
  }

  if (!meeting.canApply) {
    return { success: false, message: "신청이 불가능한 모임입니다." };
  }

  return { success: true, message: "모임 신청이 완료되었습니다!" };
}
