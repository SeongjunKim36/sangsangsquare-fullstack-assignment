"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApiClient } from "../api-client/admin";
import { CreateMeetingForm } from "../types";
import { toast } from "sonner";
import { getErrorMessage } from "../error-handler";

export const adminKeys = {
  all: ["admin"] as const,
  meetings: () => [...adminKeys.all, "meetings"] as const,
  meetingDetail: (meetingId: number) =>
    [...adminKeys.all, "meeting", meetingId] as const,
  applications: (meetingId: number) =>
    [...adminKeys.all, "applications", meetingId] as const,
};

/**
 * 관리자 모임 목록 조회
 */
export function useAdminMeetings() {
  return useQuery({
    queryKey: adminKeys.meetings(),
    queryFn: () => adminApiClient.getMeetings(),
    staleTime: 1000 * 60 * 5, // 5분
  });
}

/**
 * 모임 신청자 목록 조회
 */
export function useAdminMeetingApplications(meetingId?: number) {
  return useQuery({
    queryKey: adminKeys.applications(meetingId!),
    queryFn: () => adminApiClient.getMeetingApplications(meetingId!),
    enabled: Boolean(meetingId),
    staleTime: 1000 * 60, // 1분
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
      void queryClient.invalidateQueries({ queryKey: adminKeys.meetings() });
      void queryClient.invalidateQueries({ queryKey: ["meetings"] });
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
      applicationId,
      status,
    }: {
      applicationId: number;
      status: "SELECTED" | "REJECTED";
    }) => adminApiClient.updateApplicationStatus(applicationId, status),
    // Optimistic UI: 즉시 UI 업데이트
    onMutate: async ({ applicationId, status }) => {
      toast.loading(
        status === "SELECTED" ? "선정 처리 중..." : "탈락 처리 중...",
        { id: `status-${applicationId}` }
      );
      // 낙관적 업데이트를 위해 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: adminKeys.all });
    },
    onSuccess: (_, { status, applicationId }) => {
      toast.success(
        status === "SELECTED" ? "선정 완료!" : "탈락 처리 완료!",
        { id: `status-${applicationId}` }
      );
      void queryClient.invalidateQueries({ queryKey: adminKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["meetings"] });
      void queryClient.invalidateQueries({
        queryKey: ["viewer-applications"],
      });
    },
    onError: (error: unknown, { applicationId }) => {
      const message = getErrorMessage(error, "상태 변경 중 오류가 발생했습니다.");
      toast.error(message, { id: `status-${applicationId}` });
    },
  });
}
