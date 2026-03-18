"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Header } from "@/components/header";
import { MeetingTypeBadge } from "@/components/meeting-type-badge";
import { ApplicationStatusBadge } from "@/components/application-status-badge";
import { getViewerId } from "@/lib/user-store";
import { useViewerApplications } from "@/lib/react-query/meetings";
import { getErrorMessage } from "@/lib/error-handler";
import { ApplicationStatus } from "@/lib/types";
import { formatDateKorean, getRelativeTime, isAnnouncementPassed } from "@/lib/date-utils";
import {
  ArrowLeft,
  Calendar,
  Clock,
  AlertCircle,
  RefreshCw,
  ClipboardList,
  PartyPopper,
  ArrowRight,
} from "lucide-react";

export default function MyApplicationsPage() {
  const [viewerId, setViewerId] = useState<string>();

  useEffect(() => {
    setViewerId(getViewerId());
  }, []);

  const {
    data: applications = [],
    isLoading,
    error,
    refetch,
  } = useViewerApplications(viewerId);

  const isInitialLoading = isLoading || viewerId === undefined;

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

        <section className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">내 신청 결과</h1>
          <p className="mt-2 text-muted-foreground">신청한 모임의 결과를 확인하세요.</p>
        </section>

        {isInitialLoading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-24 mt-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isInitialLoading && error && (
          <Card className="border-destructive/50">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-10 text-center">
              <AlertCircle className="size-12 text-destructive" />
              <div>
                <h3 className="font-semibold text-lg">오류가 발생했습니다</h3>
                <p className="text-muted-foreground mt-1">
                  {getErrorMessage(error, "신청 목록을 불러오는데 실패했습니다.")}
                </p>
              </div>
              <Button onClick={() => void refetch()} variant="outline">
                <RefreshCw className="size-4" />
                다시 시도
              </Button>
            </CardContent>
          </Card>
        )}

        {!isInitialLoading && !error && applications.length === 0 && (
          <Empty className="py-20">
            <ClipboardList className="size-12 text-muted-foreground/50" />
            <EmptyTitle>신청한 모임이 없습니다</EmptyTitle>
            <EmptyDescription>관심 있는 모임에 신청해보세요!</EmptyDescription>
            <Button asChild className="mt-4">
              <Link href="/">
                모임 둘러보기
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Empty>
        )}

        {!isInitialLoading && !error && applications.length > 0 && (
          <div className="flex flex-col gap-4">
            {applications.map((application) => {
              const isPassed = isAnnouncementPassed(application.announcementAt);
              const isSelected = application.status === ApplicationStatus.SELECTED;

              return (
                <Link
                  key={application.applicationId}
                  href={`/meetings/${application.meetingId}`}
                  className="group block"
                >
                  <Card
                    className={`transition-all duration-200 hover:shadow-md hover:border-primary/20 ${
                      isSelected && isPassed
                        ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                        : ""
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2 flex-wrap">
                        <MeetingTypeBadge type={application.meetingType} />
                        <CardTitle className="text-base group-hover:text-primary transition-colors">
                          {application.meetingTitle}
                        </CardTitle>
                      </div>
                      {isSelected && isPassed && (
                        <CardDescription className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <PartyPopper className="size-4" />
                          축하합니다! 모임에 선정되었습니다!
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4" />
                          <span>
                            발표일: {formatDateKorean(application.announcementAt)}
                            <span className="ml-1 text-xs">
                              ({getRelativeTime(application.announcementAt)})
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="size-4" />
                          <span>신청일: {formatDateKorean(application.appliedAt)}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        {isPassed ? (
                          <ApplicationStatusBadge status={application.status} size="large" />
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="size-4 text-yellow-500" />
                            <span>발표일 이후 결과가 공개됩니다</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 상상단 단톡방 모임. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
