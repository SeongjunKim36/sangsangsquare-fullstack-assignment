import { Badge } from "@/components/ui/badge";
import { ApplicationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

// 신청 상태별 스타일 설정
const statusConfig: Record<
  ApplicationStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  [ApplicationStatus.PENDING]: {
    label: "대기 중",
    className: "bg-yellow-500 text-white",
    icon: <Clock className="size-3" />,
  },
  [ApplicationStatus.SELECTED]: {
    label: "선정",
    className: "bg-green-500 text-white",
    icon: <CheckCircle2 className="size-3" />,
  },
  [ApplicationStatus.REJECTED]: {
    label: "탈락",
    className: "bg-gray-400 text-white",
    icon: <XCircle className="size-3" />,
  },
};

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  size?: "default" | "large";
  showIcon?: boolean;
  className?: string;
}

export function ApplicationStatusBadge({
  status,
  size = "default",
  showIcon = true,
  className,
}: ApplicationStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      className={cn(
        "border-transparent transition-colors",
        config.className,
        size === "large" && "px-4 py-2 text-sm",
        className
      )}
    >
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );
}

// 신청 가능 상태 배지 (카드용)
interface ApplyStatusBadgeProps {
  canApply: boolean;
  myApplicationStatus: ApplicationStatus | null;
  className?: string;
}

export function ApplyStatusBadge({
  canApply,
  myApplicationStatus,
  className,
}: ApplyStatusBadgeProps) {
  // 이미 신청한 경우
  if (myApplicationStatus) {
    return (
      <Badge
        className={cn(
          "border-transparent bg-yellow-500 text-white",
          className
        )}
      >
        <Clock className="size-3" />
        신청 완료 - 대기 중
      </Badge>
    );
  }

  // 신청 가능한 경우
  if (canApply) {
    return (
      <Badge
        className={cn(
          "border-transparent bg-green-500 text-white",
          className
        )}
      >
        <CheckCircle2 className="size-3" />
        신청 가능
      </Badge>
    );
  }

  // 신청 마감
  return (
    <Badge
      className={cn("border-transparent bg-gray-400 text-white", className)}
    >
      <XCircle className="size-3" />
      신청 마감
    </Badge>
  );
}
