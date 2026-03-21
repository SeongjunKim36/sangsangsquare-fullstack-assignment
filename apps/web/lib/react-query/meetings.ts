"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { meetingsApiClient } from "../api-client/meetings";
import { toast } from "sonner";
import { celebrateSuccess } from "../confetti";
import { getErrorMessage } from "../error-handler";
import { QUERY_STALE_TIME } from "../constants";
import { useAnnouncementInvalidation } from "../use-announcement-invalidation";

export const meetingKeys = {
  all: ["meetings"] as const,
  list: (userId: number | null) => [...meetingKeys.all, "list", userId] as const,
  detail: (meetingId: number, userId: number | null) =>
    [...meetingKeys.all, "detail", userId, meetingId] as const,
  myApplications: (userId: number | null) => [...meetingKeys.all, "my-applications", userId] as const,
};

/**
 * 모임 목록 조회
 */
export function useMeetings(userId: number | null) {
  const query = useQuery({
    queryKey: meetingKeys.list(userId),
    queryFn: () => meetingsApiClient.getMeetings(),
    staleTime: QUERY_STALE_TIME,
    refetchOnWindowFocus: true,
  });

  useAnnouncementInvalidation({
    enabled: true,
    announcementAtValues: (query.data ?? []).map((meeting) => meeting.announcementAt),
    queryKeys: [meetingKeys.all],
  });

  return query;
}

/**
 * 모임 상세 조회
 */
export function useMeetingDetail(meetingId: number, userId: number | null) {
  const query = useQuery({
    queryKey: meetingKeys.detail(meetingId, userId),
    queryFn: () => meetingsApiClient.getMeetingDetail(meetingId),
    enabled: Number.isFinite(meetingId) && meetingId > 0,
    staleTime: QUERY_STALE_TIME,
    refetchOnWindowFocus: true,
  });

  useAnnouncementInvalidation({
    enabled: Boolean(query.data),
    announcementAtValues: query.data ? [query.data.announcementAt] : [],
    queryKeys: [meetingKeys.all],
  });

  return query;
}

/**
 * 내 신청 결과 조회
 */
export function useMyApplications(userId: number | null) {
  const query = useQuery({
    queryKey: meetingKeys.myApplications(userId),
    queryFn: () => meetingsApiClient.getMyApplications(),
    enabled: userId !== null,
    staleTime: QUERY_STALE_TIME,
    refetchOnWindowFocus: true,
  });

  useAnnouncementInvalidation({
    enabled: userId !== null,
    announcementAtValues: (query.data ?? []).map((application) => application.announcementAt),
    queryKeys: [meetingKeys.all],
  });

  return query;
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
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "신청 중 오류가 발생했습니다.");
      toast.error(message);
    },
  });
}
