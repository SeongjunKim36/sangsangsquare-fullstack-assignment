"use client";

import { useState, useEffect } from "react";
import { MeetingCard } from "@/components/meeting-card";
import { MeetingCardSkeletonGrid } from "@/components/meeting-card-skeleton";
import { Empty } from "@/components/ui/empty";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchMeetings } from "@/lib/mock-data";
import { MeetingListItem } from "@/lib/types";
import { AlertCircle, RefreshCw, CalendarOff } from "lucide-react";

export function MeetingList() {
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMeetings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchMeetings();
      setMeetings(data);
    } catch {
      setError("모임 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  // 로딩 상태
  if (isLoading) {
    return <MeetingCardSkeletonGrid />;
  }

  // 에러 상태
  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-10 text-center">
          <AlertCircle className="size-12 text-destructive" />
          <div>
            <h3 className="font-semibold text-lg">오류가 발생했습니다</h3>
            <p className="text-muted-foreground mt-1">{error}</p>
          </div>
          <Button onClick={loadMeetings} variant="outline">
            <RefreshCw className="size-4" />
            다시 시도
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 빈 상태
  if (meetings.length === 0) {
    return (
      <Empty className="py-20">
        <CalendarOff className="size-12 text-muted-foreground/50" />
        <Empty.Title>모집 중인 모임이 없습니다</Empty.Title>
        <Empty.Description>
          새로운 모임이 열리면 이곳에 표시됩니다.
        </Empty.Description>
      </Empty>
    );
  }

  // 모임 목록 표시
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {meetings.map((meeting) => (
        <MeetingCard key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
}
