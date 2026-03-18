"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

function getStatusCode(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return undefined;
  }

  const response = error.response;
  if (typeof response !== "object" || response === null || !("status" in response)) {
    return undefined;
  }

  return typeof response.status === "number" ? response.status : undefined;
}

/**
 * React Query Provider
 * 클라이언트 컴포넌트에서 React Query를 사용할 수 있도록 설정
 */
export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 5분 동안 캐시 유지
            staleTime: 5 * 60 * 1000,
            // 실패 시 재시도 설정: 최대 3번, 지수 백오프
            retry: (failureCount, error: unknown) => {
              const statusCode = getStatusCode(error);
              // 404 또는 403 같은 클라이언트 에러는 재시도하지 않음
              if (statusCode && statusCode < 500) {
                return false;
              }
              // 최대 3번까지만 재시도
              return failureCount < 3;
            },
            // 재시도 지연: 1초, 2초, 4초 (지수 백오프)
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // 윈도우 포커스 시 자동 refetch 비활성화
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Mutation 실패 시 1번 재시도
            retry: (failureCount, error: unknown) => {
              const statusCode = getStatusCode(error);
              // 클라이언트 에러는 재시도하지 않음
              if (statusCode && statusCode < 500) {
                return false;
              }
              return failureCount < 1;
            },
            retryDelay: 1000,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
