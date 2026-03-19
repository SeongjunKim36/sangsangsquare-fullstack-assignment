"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApiClient } from "../api-client/auth";
import { getErrorMessage } from "../error-handler";
import { QUERY_STALE_TIME } from "../constants";
import { adminKeys } from "./admin";
import { meetingKeys } from "./meetings";
import { toast } from "sonner";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authApiClient.getCurrentUser(),
    staleTime: QUERY_STALE_TIME,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApiClient.logout(),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me(), null);
      queryClient.removeQueries({ queryKey: meetingKeys.all });
      queryClient.removeQueries({ queryKey: meetingKeys.myApplications() });
      queryClient.removeQueries({ queryKey: adminKeys.all });
      toast.success("로그아웃되었습니다.");
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "로그아웃에 실패했습니다.");
      toast.error(message);
    },
  });
}
