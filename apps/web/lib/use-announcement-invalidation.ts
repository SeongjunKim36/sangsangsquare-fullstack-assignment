"use client";

import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { useEffect, useEffectEvent } from "react";

const INVALIDATION_BUFFER_MS = 1000;
const MAX_TIMEOUT_MS = 1000 * 60 * 60 * 6;

function getNextAnnouncementTimestamp(announcementAtValues: Array<string | null | undefined>) {
  const now = Date.now();

  const timestamps = announcementAtValues
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value).getTime())
    .filter((timestamp) => Number.isFinite(timestamp) && timestamp > now);

  if (timestamps.length === 0) {
    return null;
  }

  return Math.min(...timestamps);
}

type UseAnnouncementInvalidationParams = {
  announcementAtValues: Array<string | null | undefined>;
  queryKeys: readonly QueryKey[];
  enabled?: boolean;
};

export function useAnnouncementInvalidation({
  announcementAtValues,
  queryKeys,
  enabled = true,
}: UseAnnouncementInvalidationParams) {
  const queryClient = useQueryClient();
  const nextAnnouncementTimestamp = getNextAnnouncementTimestamp(announcementAtValues);

  const invalidateQueries = useEffectEvent(() => {
    for (const queryKey of queryKeys) {
      void queryClient.invalidateQueries({ queryKey });
    }
  });

  useEffect(() => {
    if (!enabled || nextAnnouncementTimestamp === null) {
      return;
    }

    let timerId: number | null = null;

    const scheduleInvalidation = () => {
      const remainingMs = nextAnnouncementTimestamp - Date.now() + INVALIDATION_BUFFER_MS;
      const timeoutMs = Math.max(
        Math.min(remainingMs, MAX_TIMEOUT_MS),
        INVALIDATION_BUFFER_MS
      );

      timerId = window.setTimeout(() => {
        if (remainingMs <= MAX_TIMEOUT_MS) {
          invalidateQueries();
          return;
        }

        scheduleInvalidation();
      }, timeoutMs);
    };

    scheduleInvalidation();

    return () => {
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    };
  }, [enabled, nextAnnouncementTimestamp]);
}
