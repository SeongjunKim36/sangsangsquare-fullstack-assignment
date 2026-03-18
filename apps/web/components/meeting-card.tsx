"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MeetingTypeBadge } from "@/components/meeting-type-badge";
import { ApplyStatusBadge } from "@/components/application-status-badge";
import { MeetingListItem } from "@/lib/types";
import { formatDateKorean, getRelativeTime } from "@/lib/date-utils";
import { Users, Calendar, ArrowRight } from "lucide-react";

interface MeetingCardProps {
  meeting: MeetingListItem;
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  return (
    <Link href={`/meetings/${meeting.id}`} className="group block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/20 group-focus-visible:ring-2 group-focus-visible:ring-ring">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <MeetingTypeBadge type={meeting.type} />
              <ApplyStatusBadge
                canApply={meeting.canApply}
                myApplicationStatus={meeting.myApplicationStatus}
              />
            </div>
            <CardTitle className="mt-3 text-lg leading-tight group-hover:text-primary transition-colors">
              {meeting.title}
            </CardTitle>
            {meeting.description && (
              <CardDescription className="line-clamp-2 mt-1">{meeting.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              {/* 모집 인원 정보 */}
              <div className="flex items-center gap-2">
                <Users className="size-4" />
                <span>
                  모집 {meeting.capacity}명 · 신청 {meeting.applicantCount}명
                </span>
              </div>
              {/* 발표일 정보 */}
              <div className="flex items-center gap-2">
                <Calendar className="size-4" />
                <span>발표일: {formatDateKorean(meeting.announcementAt)}</span>
                <span className="text-xs text-muted-foreground/70">
                  ({getRelativeTime(meeting.announcementAt)})
                </span>
              </div>
            </div>
            {/* 상세 보기 안내 */}
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              상세 보기
              <ArrowRight className="size-4" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
