"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApiClient } from "../api-client/admin";
import { CreateMeetingForm } from "../types";
import { toast } from "sonner";
import { getErrorMessage } from "../error-handler";
import { QUERY_STALE_TIME } from "../constants";
import { meetingKeys } from "./meetings";
import { useAnnouncementInvalidation } from "../use-announcement-invalidation";

export const adminKeys = {
  all: ["admin"] as const,
  meetings: (userId: number | null) => [...adminKeys.all, "meetings", userId] as const,
  meetingDetail: (meetingId: number, userId: number | null) =>
    [...adminKeys.all, "meeting", userId, meetingId] as const,
  applications: (meetingId: number | null, userId: number | null) =>
    [...adminKeys.all, "applications", userId, meetingId] as const,
};

/**
 * 관리자 모임 목록 조회
 */
export function useAdminMeetings(userId: number | null, enabled = true) {
  const query = useQuery({
    queryKey: adminKeys.meetings(userId),
    queryFn: () => adminApiClient.getMeetings(),
    enabled: enabled && userId !== null,
    staleTime: QUERY_STALE_TIME,
    refetchOnWindowFocus: true,
  });

  useAnnouncementInvalidation({
    enabled: enabled && userId !== null,
    announcementAtValues: (query.data ?? []).map((meeting) => meeting.announcementAt),
    queryKeys: [adminKeys.all],
  });

  return query;
}

/**
 * 모임 신청자 목록 조회
 */
export function useAdminMeetingApplications(
  meetingId: number | null,
  userId: number | null,
  enabled = true
) {
  return useQuery({
    queryKey: adminKeys.applications(meetingId, userId),
    queryFn: () => adminApiClient.getMeetingApplications(meetingId as number),
    enabled: enabled && userId !== null && meetingId !== null,
    staleTime: QUERY_STALE_TIME / 5, // 1분 (관리자 페이지는 더 자주 갱신)
    refetchOnWindowFocus: true,
  });
}

/**
 * 모임 생성
 */
export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMeetingForm) => adminApiClient.createMeeting(data),
    onSuccess: () => {
      toast.success("모임이 생성되었습니다.");
      void queryClient.invalidateQueries({ queryKey: adminKeys.all });
      void queryClient.invalidateQueries({ queryKey: meetingKeys.all });
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "모임 생성 중 오류가 발생했습니다.");
      toast.error(message);
    },
  });
}

/**
 * 신청자 상태 변경 (선정/탈락) - Optimistic UI 적용
 */
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      meetingId,
      applicationId,
      status,
    }: {
      meetingId: number;
      applicationId: number;
      status: "SELECTED" | "REJECTED";
    }) => adminApiClient.updateApplicationStatus(meetingId, applicationId, status),
    // Optimistic UI: 즉시 UI 업데이트
    onMutate: async ({ applicationId, status }) => {
      toast.loading(status === "SELECTED" ? "선정 처리 중..." : "탈락 처리 중...", {
        id: `status-${applicationId}`,
      });
      // 낙관적 업데이트를 위해 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: adminKeys.all });
    },
    onSuccess: (_, { status, applicationId }) => {
      toast.success(status === "SELECTED" ? "선정 완료!" : "탈락 처리 완료!", {
        id: `status-${applicationId}`,
      });
      void queryClient.invalidateQueries({ queryKey: adminKeys.all });
      void queryClient.invalidateQueries({ queryKey: meetingKeys.all });
    },
    onError: (error: unknown, { applicationId }) => {
      const message = getErrorMessage(error, "상태 변경 중 오류가 발생했습니다.");
      toast.error(message, { id: `status-${applicationId}` });
    },
  });
}
