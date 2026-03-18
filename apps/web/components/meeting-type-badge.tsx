import { Badge } from "@/components/ui/badge";
import { MeetingType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BookOpen, Dumbbell, PenLine, Languages } from "lucide-react";

// 모임 유형별 스타일 설정
const typeConfig: Record<MeetingType, { label: string; className: string; icon: React.ReactNode }> =
  {
    [MeetingType.BOOK]: {
      label: "독서",
      className: "bg-blue-500 text-white hover:bg-blue-600",
      icon: <BookOpen className="size-3" />,
    },
    [MeetingType.EXERCISE]: {
      label: "운동",
      className: "bg-green-500 text-white hover:bg-green-600",
      icon: <Dumbbell className="size-3" />,
    },
    [MeetingType.RECORD]: {
      label: "기록",
      className: "bg-orange-500 text-white hover:bg-orange-600",
      icon: <PenLine className="size-3" />,
    },
    [MeetingType.ENGLISH]: {
      label: "영어",
      className: "bg-violet-500 text-white hover:bg-violet-600",
      icon: <Languages className="size-3" />,
    },
  };

interface MeetingTypeBadgeProps {
  type: MeetingType;
  showIcon?: boolean;
  className?: string;
}

export function MeetingTypeBadge({ type, showIcon = true, className }: MeetingTypeBadgeProps) {
  const config = typeConfig[type];

  return (
    <Badge className={cn("border-transparent transition-colors", config.className, className)}>
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );
}
