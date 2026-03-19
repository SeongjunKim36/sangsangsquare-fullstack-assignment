"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { meetingsApiClient } from "../api-client/meetings";
import { toast } from "sonner";
import { celebrateSuccess } from "../confetti";
import { getErrorMessage } from "../error-handler";
import { QUERY_STALE_TIME } from "../constants";

export const meetingKeys = {
  all: ["meetings"] as const,
  list: (viewerId?: string) => [...meetingKeys.all, "list", viewerId] as const,
  detail: (meetingId: number, viewerId?: string) =>
    [...meetingKeys.all, "detail", meetingId, viewerId] as const,
  viewerApplications: (viewerId?: string) =>
    ["viewer-applications", viewerId] as const,
};

/**
 * 모임 목록 조회
 */
export function useMeetings(viewerId?: string) {
  return useQuery({
    queryKey: meetingKeys.list(viewerId),
    queryFn: () => meetingsApiClient.getMeetings(viewerId),
    staleTime: QUERY_STALE_TIME,
  });
}

/**
 * 모임 상세 조회
 */
export function useMeetingDetail(meetingId: number, viewerId?: string) {
  return useQuery({
    queryKey: meetingKeys.detail(meetingId, viewerId),
    queryFn: () => meetingsApiClient.getMeetingDetail(meetingId, viewerId),
    enabled: Number.isFinite(meetingId) && meetingId > 0,
    staleTime: QUERY_STALE_TIME,
  });
}

/**
 * 내 신청 결과 조회
 */
export function useViewerApplications(viewerId?: string) {
  return useQuery({
    queryKey: meetingKeys.viewerApplications(viewerId),
    queryFn: () => meetingsApiClient.getViewerApplications(viewerId!),
    enabled: Boolean(viewerId),
    staleTime: QUERY_STALE_TIME,
  });
}

/**
 * 모임 신청
 */
export function useApplyToMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      meetingId,
      applicantId,
      applicantName,
    }: {
      meetingId: number;
      applicantId: string;
      applicantName: string;
    }) =>
      meetingsApiClient.applyToMeeting(meetingId, {
        applicantId,
        applicantName,
      }),
    onSuccess: () => {
      toast.success("모임 신청이 완료되었습니다!");
      celebrateSuccess(); // 🎉 Confetti 효과
      void queryClient.invalidateQueries({ queryKey: meetingKeys.all });
      void queryClient.invalidateQueries({
        queryKey: ["viewer-applications"],
      });
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "신청 중 오류가 발생했습니다.");
      toast.error(message);
    },
  });
}
