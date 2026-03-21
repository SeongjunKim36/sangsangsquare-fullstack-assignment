"use client";

import { MeetingCard } from "@/components/meeting-card";
import { MeetingCardSkeletonGrid } from "@/components/meeting-card-skeleton";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMeetings } from "@/lib/react-query/meetings";
import { useCurrentUser } from "@/lib/react-query/auth";
import { getErrorMessage } from "@/lib/error-handler";
import { AlertCircle, RefreshCw, CalendarOff } from "lucide-react";

export function MeetingList() {
  const currentUserQuery = useCurrentUser();
  const currentUser = currentUserQuery.data;
  const currentUserId = currentUser?.id ?? null;
  const {
    data: meetings = [],
    isLoading,
    error,
    refetch,
  } = useMeetings(currentUserId);

  if (isLoading) {
    return <MeetingCardSkeletonGrid />;
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-10 text-center">
          <AlertCircle className="size-12 text-destructive" />
          <div>
            <h3 className="font-semibold text-lg">오류가 발생했습니다</h3>
            <p className="text-muted-foreground mt-1">
              {getErrorMessage(error, "모임 목록을 불러오는데 실패했습니다.")}
            </p>
          </div>
          <Button onClick={() => void refetch()} variant="outline">
            <RefreshCw className="size-4" />
            다시 시도
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (meetings.length === 0) {
    return (
      <Empty className="py-20">
        <CalendarOff className="size-12 text-muted-foreground/50" />
        <EmptyTitle>모집 중인 모임이 없습니다</EmptyTitle>
        <EmptyDescription>새로운 모임이 열리면 이곳에 표시됩니다.</EmptyDescription>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {meetings.map((meeting) => (
        <MeetingCard key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
}
