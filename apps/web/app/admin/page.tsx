"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Shield,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { MeetingTypeBadge } from "@/components/meeting-type-badge";
import { ApplicationStatusBadge } from "@/components/application-status-badge";
import { MeetingType, ApplicationStatus, AdminMeetingItem, Applicant } from "@/lib/types";
import {
  useAdminMeetingApplications,
  useAdminMeetings,
  useCreateMeeting,
  useUpdateApplicationStatus,
} from "@/lib/react-query/admin";
import { formatDateKorean, getRelativeTime, isAnnouncementPassed } from "@/lib/date-utils";
import { getErrorMessage } from "@/lib/error-handler";

const meetingTypeLabels: Record<MeetingType, string> = {
  [MeetingType.BOOK]: "독서",
  [MeetingType.EXERCISE]: "운동",
  [MeetingType.RECORD]: "기록",
  [MeetingType.ENGLISH]: "영어",
};

export default function AdminPage() {
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const [formType, setFormType] = useState<MeetingType | "">("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCapacity, setFormCapacity] = useState("");
  const [formAnnouncementAt, setFormAnnouncementAt] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    applicant: Applicant | null;
    action: "select" | "reject";
  }>({ open: false, applicant: null, action: "select" });

  const meetingsQuery = useAdminMeetings();
  const createMeetingMutation = useCreateMeeting();
  const updateStatusMutation = useUpdateApplicationStatus();

  const meetings = meetingsQuery.data ?? [];
  const selectedMeeting = meetings.find((meeting) => meeting.id === selectedMeetingId) ?? null;

  const applicationsQuery = useAdminMeetingApplications(selectedMeetingId ?? undefined);
  const applicants = applicationsQuery.data ?? [];

  const handleCreateMeeting = async () => {
    if (!formType) {
      toast.error("모임 유형을 선택해주세요.");
      return;
    }
    if (!formTitle.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    if (!formCapacity || Number(formCapacity) < 1) {
      toast.error("모집 인원을 1명 이상 입력해주세요.");
      return;
    }
    if (!formAnnouncementAt) {
      toast.error("발표일을 입력해주세요.");
      return;
    }

    try {
      const response = await createMeetingMutation.mutateAsync({
        type: formType as MeetingType,
        title: formTitle.trim(),
        description: formDescription.trim(),
        capacity: Number(formCapacity),
        announcementAt: new Date(formAnnouncementAt).toISOString(),
      });

      setFormType("");
      setFormTitle("");
      setFormDescription("");
      setFormCapacity("");
      setFormAnnouncementAt("");
      setSelectedMeetingId(response.meetingId);
    } catch {
      // 토스트는 mutation 훅에서 처리
    }
  };

  const handleUpdateStatus = async () => {
    const { applicant, action } = confirmDialog;
    if (!applicant || !selectedMeeting) {
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        applicationId: applicant.applicationId,
        status: action === "select" ? "SELECTED" : "REJECTED",
      });
      setConfirmDialog({ open: false, applicant: null, action: "select" });
      await Promise.all([meetingsQuery.refetch(), applicationsQuery.refetch()]);
    } catch {
      // 토스트는 mutation 훅에서 처리
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="size-8">
                <ArrowLeft className="size-4" />
                <span className="sr-only">뒤로가기</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-blue-500" />
              <h1 className="text-lg font-semibold">관리자 페이지</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="w-full space-y-6 lg:w-2/5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Plus className="size-4" />
                  새 모임 생성
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meeting-type">모임 유형</Label>
                  <Select
                    value={formType}
                    onValueChange={(value) => setFormType(value as MeetingType)}
                  >
                    <SelectTrigger id="meeting-type" className="w-full">
                      <SelectValue placeholder="유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(meetingTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting-title">제목</Label>
                  <Input
                    id="meeting-title"
                    placeholder="모임 제목을 입력하세요"
                    value={formTitle}
                    onChange={(event) => setFormTitle(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting-description">설명</Label>
                  <Textarea
                    id="meeting-description"
                    placeholder="모임 설명을 입력하세요"
                    value={formDescription}
                    onChange={(event) => setFormDescription(event.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting-capacity">모집 인원</Label>
                  <Input
                    id="meeting-capacity"
                    type="number"
                    min={1}
                    placeholder="예: 10"
                    value={formCapacity}
                    onChange={(event) => setFormCapacity(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting-announcement">발표일</Label>
                  <Input
                    id="meeting-announcement"
                    type="datetime-local"
                    value={formAnnouncementAt}
                    onChange={(event) => setFormAnnouncementAt(event.target.value)}
                  />
                </div>

                <Button
                  className="w-full bg-blue-500 text-white hover:bg-blue-600"
                  onClick={() => void handleCreateMeeting()}
                  disabled={createMeetingMutation.isPending}
                >
                  {createMeetingMutation.isPending ? "생성 중..." : "모임 생성"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="size-4" />
                  모임 목록
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {meetingsQuery.isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => <MeetingItemSkeleton key={index} />)
                ) : meetingsQuery.error ? (
                  <ErrorState
                    message={getErrorMessage(
                      meetingsQuery.error,
                      "모임 목록을 불러오는데 실패했습니다."
                    )}
                    onRetry={() => void meetingsQuery.refetch()}
                  />
                ) : meetings.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    생성된 모임이 없습니다.
                  </p>
                ) : (
                  meetings.map((meeting) => (
                    <MeetingItem
                      key={meeting.id}
                      meeting={meeting}
                      isSelected={meeting.id === selectedMeetingId}
                      onSelect={() => setSelectedMeetingId(meeting.id)}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="w-full lg:w-3/5">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {selectedMeeting ? (
                    <>
                      <MeetingTypeBadge type={selectedMeeting.type} />
                      <span>{selectedMeeting.title}</span>
                      <span className="ml-auto text-sm font-normal text-muted-foreground">
                        정원 {selectedMeeting.selectedCount}/{selectedMeeting.capacity}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">신청자 목록</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedMeetingId || !selectedMeeting ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
                    <Users className="size-12 opacity-50" />
                    <p>{selectedMeetingId ? "모임 정보를 불러오는 중입니다" : "좌측에서 모임을 선택하세요"}</p>
                  </div>
                ) : applicationsQuery.isLoading ? (
                  <ApplicantTableSkeleton />
                ) : applicationsQuery.error ? (
                  <ErrorState
                    message={getErrorMessage(
                      applicationsQuery.error,
                      "신청자 목록을 불러오는데 실패했습니다."
                    )}
                    onRetry={() => void applicationsQuery.refetch()}
                  />
                ) : applicants.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
                    <Users className="size-12 opacity-50" />
                    <p>신청자가 없습니다</p>
                  </div>
                ) : (
                  <ApplicantTable
                    applicants={applicants}
                    meeting={selectedMeeting}
                    onUpdateStatus={(applicant, action) =>
                      setConfirmDialog({ open: true, applicant, action })
                    }
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 상상단 단톡방 모임. All rights reserved.
        </div>
      </footer>

      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          !open && setConfirmDialog({ open: false, applicant: null, action: "select" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.action === "select" ? "선정 확인" : "탈락 확인"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.applicant?.applicantName}님을{" "}
              {confirmDialog.action === "select" ? "선정" : "탈락"}하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({
                  open: false,
                  applicant: null,
                  action: "select",
                })
              }
            >
              취소
            </Button>
            <Button
              className={
                confirmDialog.action === "select"
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-500 text-white hover:bg-gray-600"
              }
              onClick={() => void handleUpdateStatus()}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending
                ? "처리 중..."
                : confirmDialog.action === "select"
                  ? "선정"
                  : "탈락"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 px-4 py-8 text-center">
      <AlertCircle className="size-8 text-destructive" />
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="size-4" />
        다시 시도
      </Button>
    </div>
  );
}

function MeetingItem({
  meeting,
  isSelected,
  onSelect,
}: {
  meeting: AdminMeetingItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-lg border p-4 text-left transition-colors ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-border hover:border-blue-300 hover:bg-muted/50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <MeetingTypeBadge type={meeting.type} showIcon={false} />
          <span className="font-medium">{meeting.title}</span>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="size-3" />
          전체 {meeting.applicantCount}명
        </span>
        <span className="flex items-center gap-1 text-green-600">
          <CheckCircle2 className="size-3" />
          선정 {meeting.selectedCount}명
        </span>
        <span className="flex items-center gap-1 text-gray-500">
          <XCircle className="size-3" />
          탈락 {meeting.rejectedCount}명
        </span>
        <span className="flex items-center gap-1 text-yellow-600">
          <Clock className="size-3" />
          대기 {meeting.pendingCount}명
        </span>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <Calendar className="size-3" />
        발표일: {formatDateKorean(meeting.announcementAt)}
        {isAnnouncementPassed(meeting.announcementAt) ? (
          <span className="ml-1 text-green-600">(발표 완료)</span>
        ) : (
          <span className="ml-1 text-blue-500">({getRelativeTime(meeting.announcementAt)})</span>
        )}
      </div>
    </button>
  );
}

function MeetingItemSkeleton() {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="mt-2 flex gap-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="mt-2">
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}

function ApplicantTable({
  applicants,
  meeting,
  onUpdateStatus,
}: {
  applicants: Applicant[];
  meeting: AdminMeetingItem;
  onUpdateStatus: (applicant: Applicant, action: "select" | "reject") => void;
}) {
  const isPassed = isAnnouncementPassed(meeting.announcementAt);
  const isCapacityFull = meeting.selectedCount >= meeting.capacity;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>신청자명</TableHead>
          <TableHead>신청일</TableHead>
          <TableHead>상태</TableHead>
          <TableHead className="text-right">액션</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applicants.map((applicant) => (
          <TableRow key={applicant.applicationId}>
            <TableCell className="font-medium">{applicant.applicantName}</TableCell>
            <TableCell className="text-muted-foreground">
              {getRelativeTime(applicant.appliedAt)}
            </TableCell>
            <TableCell>
              <ApplicationStatusBadge status={applicant.status} />
            </TableCell>
            <TableCell className="text-right">
              {applicant.status === ApplicationStatus.PENDING ? (
                isPassed ? (
                  <div className="flex justify-end gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            size="sm"
                            className="bg-green-500 text-white hover:bg-green-600"
                            onClick={() => onUpdateStatus(applicant, "select")}
                            disabled={isCapacityFull}
                          >
                            선정
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {isCapacityFull && <TooltipContent>정원이 가득 찼습니다</TooltipContent>}
                    </Tooltip>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateStatus(applicant, "reject")}
                    >
                      탈락
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end text-xs text-muted-foreground">
                    발표일 이후 처리 가능
                  </div>
                )
              ) : (
                <div className="flex justify-end text-xs text-muted-foreground">처리 완료</div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ApplicantTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 border-b pb-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16" />
          <div className="ml-auto flex gap-2">
            <Skeleton className="h-8 w-14" />
            <Skeleton className="h-8 w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}
