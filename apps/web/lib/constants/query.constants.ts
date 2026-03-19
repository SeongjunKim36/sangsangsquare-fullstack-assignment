/**
 * React Query 관련 상수
 */

/** 캐시 유지 시간 (5분) */
export const QUERY_STALE_TIME = 5 * 60 * 1000;

/** 재시도 횟수 */
export const QUERY_RETRY_COUNT = 3;

/** 재시도 지연 시간 (지수 백오프) */
export const QUERY_RETRY_DELAY = (attemptIndex: number) =>
  Math.min(1000 * 2 ** attemptIndex, 30000);
