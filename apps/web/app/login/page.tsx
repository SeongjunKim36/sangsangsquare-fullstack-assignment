"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Shield, ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authApiClient } from "@/lib/api-client/auth";
import { getErrorMessage } from "@/lib/error-handler";
import { adminKeys } from "@/lib/react-query/admin";
import { authKeys, useCurrentUser } from "@/lib/react-query/auth";
import { meetingKeys } from "@/lib/react-query/meetings";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUserQuery = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });

  useEffect(() => {
    if (!currentUserQuery.data) {
      return;
    }

    router.replace(currentUserQuery.data.role === "ADMIN" ? "/admin" : "/");
  }, [currentUserQuery.data, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userId.trim()) {
      toast.error("아이디를 입력해주세요.");
      return;
    }

    if (!formData.password) {
      toast.error("비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      queryClient.removeQueries({ queryKey: meetingKeys.all });
      queryClient.removeQueries({ queryKey: adminKeys.all });

      const response = await authApiClient.login({
        userId: formData.userId.trim(),
        password: formData.password,
      });

      queryClient.setQueryData(authKeys.me(), response.user);
      toast.success(response.message);

      if (response.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, "로그인에 실패했습니다.");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center px-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="size-8">
              <ArrowLeft className="size-4" />
              <span className="sr-only">뒤로가기</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="size-6 text-blue-500" />
              <CardTitle className="text-2xl">로그인</CardTitle>
            </div>
            <CardDescription className="text-center">
              사내 테스트 계정으로 로그인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">아이디</Label>
                <Input
                  id="userId"
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={formData.userId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, userId: e.target.value }))}
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-500 text-white hover:bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? "로그인 중..." : "로그인"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <Link href="/" className="hover:text-primary hover:underline">
                  메인으로 돌아가기
                </Link>
              </div>
            </form>

            <div className="mt-6 rounded-lg border bg-muted/30 p-4 text-sm">
              <p className="font-medium">테스트 계정</p>
              <div className="mt-2 space-y-1 text-muted-foreground">
                <p>
                  관리자: <code>admin</code> / <code>admin123</code>
                </p>
                <p>
                  사용자: <code>user1</code> / <code>user123</code>
                </p>
                <p>
                  사용자: <code>user2</code> / <code>user123</code>
                </p>
                <p>
                  사용자: <code>user3</code> / <code>user123</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 상상단 단톡방 모임. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
