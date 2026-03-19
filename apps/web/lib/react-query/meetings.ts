"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { meetingsApiClient } from "../api-client/meetings";
import { toast } from "sonner";
import { celebrateSuccess } from "../confetti";
import { getErrorMessage } from "../error-handler";
import { QUERY_STALE_TIME } from "../constants";

export const meetingKeys = {
  all: ["meetings"] as const,
  list: () => [...meetingKeys.all, "list"] as const,
  detail: (meetingId: number) => [...meetingKeys.all, "detail", meetingId] as const,
  myApplications: () => ["my-applications"] as const,
};

/**
 * 모임 목록 조회
 */
export function useMeetings(enabled = true) {
  return useQuery({
    queryKey: meetingKeys.list(),
    queryFn: () => meetingsApiClient.getMeetings(),
    enabled,
    staleTime: QUERY_STALE_TIME,
  });
}

/**
 * 모임 상세 조회
 */
export function useMeetingDetail(meetingId: number, enabled = true) {
  return useQuery({
    queryKey: meetingKeys.detail(meetingId),
    queryFn: () => meetingsApiClient.getMeetingDetail(meetingId),
    enabled: enabled && Number.isFinite(meetingId) && meetingId > 0,
    staleTime: QUERY_STALE_TIME,
  });
}

/**
 * 내 신청 결과 조회
 */
export function useMyApplications(enabled = true) {
  return useQuery({
    queryKey: meetingKeys.myApplications(),
    queryFn: () => meetingsApiClient.getMyApplications(),
    enabled,
    staleTime: QUERY_STALE_TIME,
  });
}

/**
 * 모임 신청
 */
export function useApplyToMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ meetingId }: { meetingId: number }) =>
      meetingsApiClient.applyToMeeting(meetingId),
    onSuccess: () => {
      toast.success("모임 신청이 완료되었습니다!");
      celebrateSuccess(); // 🎉 Confetti 효과
      void queryClient.invalidateQueries({ queryKey: meetingKeys.all });
      void queryClient.invalidateQueries({ queryKey: meetingKeys.myApplications() });
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "신청 중 오류가 발생했습니다.");
      toast.error(message);
    },
  });
}
