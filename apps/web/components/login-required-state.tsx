import Link from "next/link";
import { Lock, LogIn } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type LoginRequiredStateProps = {
  title?: string;
  description?: string;
};

export function LoginRequiredState({
  title = "로그인이 필요합니다",
  description = "사내 테스트 계정으로 로그인한 뒤 이용해주세요.",
}: LoginRequiredStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <Lock className="size-12 text-muted-foreground" />
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button asChild>
          <Link href="/login">
            <LogIn className="size-4" />
            로그인하러 가기
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
