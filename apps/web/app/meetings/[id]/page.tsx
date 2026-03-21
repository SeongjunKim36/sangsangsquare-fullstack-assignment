"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import { MeetingTypeBadge } from "@/components/meeting-type-badge";
import { ApplicationStatusBadge } from "@/components/application-status-badge";
import { formatDateKorean, getRelativeTime } from "@/lib/date-utils";
import { getErrorMessage } from "@/lib/error-handler";
import { useApplyToMeeting, useMeetingDetail } from "@/lib/react-query/meetings";
import { useCurrentUser } from "@/lib/react-query/auth";
import {
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  LogIn,
} from "lucide-react";

interface MeetingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MeetingDetailPage({ params }: MeetingDetailPageProps) {
  const { id } = use(params);
  const meetingId = Number(id);
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const currentUserQuery = useCurrentUser();
  const currentUser = currentUserQuery.data;
  const currentUserId = currentUser?.id ?? null;

  const {
    data: meeting,
    isLoading,
    error,
    refetch,
  } = useMeetingDetail(meetingId, currentUserId);
  const applyMutation = useApplyToMeeting();

  const isInitialLoading = isLoading;

  const handleApply = async () => {
    try {
      await applyMutation.mutateAsync({
        meetingId,
      });
      setShowConfirmDialog(false);
      await refetch();
    } catch {
      // 토스트는 mutation 훅에서 처리
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6 max-w-2xl">
          <Skeleton className="h-8 w-24 mb-6" />
          <Skeleton className="h-6 w-20 mb-3" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-20 w-full mb-6" />
          <Card>
            <CardContent className="py-6">
              <div className="flex flex-col gap-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-48" />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6 max-w-2xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/">
              <ArrowLeft className="size-4" />
              목록으로
            </Link>
          </Button>

          <Card className="border-destructive/50">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-10 text-center">
              <AlertCircle className="size-12 text-destructive" />
              <div>
                <h3 className="font-semibold text-lg">오류가 발생했습니다</h3>
                <p className="text-muted-foreground mt-1">
                  {error
                    ? getErrorMessage(error, "모임 정보를 불러오는데 실패했습니다.")
                    : "모임을 찾을 수 없습니다."}
                </p>
              </div>
              <Button onClick={() => router.push("/")} variant="outline">
                목록으로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const hasApplied = Boolean(meeting.myApplication);
  const canApplyNow = Boolean(currentUser) && meeting.canApply && !hasApplied;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-2xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="size-4" />
            목록으로
          </Link>
        </Button>

        <div className="mb-6">
          <MeetingTypeBadge type={meeting.type} className="mb-3" />
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-balance">
            {meeting.title}
          </h1>
        </div>

        {meeting.description && (
          <p className="text-muted-foreground leading-relaxed mb-6">{meeting.description}</p>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">모임 안내</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-3">
                <Users className="size-5 text-muted-foreground" />
                <span>
                  모집 인원: <strong>{meeting.capacity}명</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <User className="size-5 text-muted-foreground" />
                <span>
                  현재 신청: <strong>{meeting.applicantCount}명</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="size-5 text-muted-foreground" />
                <span>
                  발표일: <strong>{formatDateKorean(meeting.announcementAt)}</strong>
                  <span className="text-muted-foreground ml-2">
                    ({getRelativeTime(meeting.announcementAt)})
                  </span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          {!currentUser && meeting.canApply && (
            <Card className="mb-4 border-primary/20 bg-primary/5">
              <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">로그인하고 이 모임에 신청해보세요</p>
                  <p className="text-sm text-muted-foreground">
                    발표일 전까지 신청할 수 있고, 결과는 발표일 이후 공개됩니다.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/login">
                    <LogIn className="size-4" />
                    로그인하고 신청하기
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {canApplyNow ? (
            <Button
              size="lg"
              className="w-full text-base"
              onClick={() => setShowConfirmDialog(true)}
            >
              <CheckCircle2 className="size-5" />
              모임 신청하기
            </Button>
          ) : hasApplied ? (
            <Button
              size="lg"
              className="w-full text-base cursor-default"
              variant="secondary"
              disabled
            >
              <Clock className="size-5" />
              신청 완료
            </Button>
          ) : !currentUser && meeting.canApply ? (
            <Button size="lg" className="w-full text-base" asChild>
              <Link href="/login">
                <LogIn className="size-5" />
                로그인하고 신청하기
              </Link>
            </Button>
          ) : (
            <Button size="lg" className="w-full text-base" variant="secondary" disabled>
              모집 마감
            </Button>
          )}
        </div>

        {meeting.myApplication && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">내 신청 현황</CardTitle>
              <CardDescription>현재 모임에 대한 신청 상태를 확인할 수 있어요.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <User className="size-5 text-muted-foreground" />
                  <span>
                    신청자명: <strong>{meeting.myApplication.applicantName}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="size-5 text-muted-foreground" />
                  <span>
                    신청일: <strong>{formatDateKorean(meeting.myApplication.appliedAt)}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="size-5 text-muted-foreground" />
                  <span className="flex items-center gap-2">
                    상태:
                    <ApplicationStatusBadge status={meeting.myApplication.status} size="large" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>모임 신청 확인</DialogTitle>
            <DialogDescription>
              <strong>{meeting.title}</strong> 모임에 신청하시겠습니까?
              <br />
              발표일({formatDateKorean(meeting.announcementAt)}) 이후 결과를 확인하실 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={applyMutation.isPending}
            >
              취소
            </Button>
            <Button onClick={() => void handleApply()} disabled={applyMutation.isPending}>
              {applyMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  신청 중...
                </>
              ) : (
                "신청하기"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 상상단. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
