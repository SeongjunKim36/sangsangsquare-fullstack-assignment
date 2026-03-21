"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, ClipboardList, Settings, LogIn, LogOut, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCurrentUser, useLogout } from "@/lib/react-query/auth";

export function Header() {
  const router = useRouter();
  const currentUserQuery = useCurrentUser();
  const logoutMutation = useLogout();
  const currentUser = currentUserQuery.data;
  const isCheckingAuth = currentUserQuery.isLoading;

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push("/login");
    } catch {
      // 토스트는 mutation 훅에서 처리
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="flex flex-col">
            <span className="font-semibold text-lg leading-none">상상단</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              자기계발 모임
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {currentUser && (
            <div className="flex items-center gap-2 text-sm">
              {currentUser.role === "ADMIN" && <Shield className="size-4 text-blue-500" />}
              <span className="text-muted-foreground">
                <User className="inline size-3 mr-1" />
                {currentUser.name}
              </span>
            </div>
          )}

          <nav className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            {!isCheckingAuth &&
              (currentUser ? (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link
                      href="/my"
                      className="flex items-center gap-1"
                      aria-label="내 신청 결과 페이지로 이동"
                    >
                      <ClipboardList className="size-4" />
                      <span className="hidden sm:inline">내 신청</span>
                    </Link>
                  </Button>
                  {currentUser.role === "ADMIN" && (
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href="/admin"
                        className="flex items-center gap-1"
                        aria-label="운영 대시보드로 이동"
                      >
                        <Settings className="size-4" />
                        <span className="hidden sm:inline">운영</span>
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleLogout()}
                    className="flex items-center gap-1"
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="size-4" />
                    <span className="hidden sm:inline">로그아웃</span>
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href="/login"
                    className="flex items-center gap-1"
                    aria-label="로그인 페이지로 이동"
                  >
                    <LogIn className="size-4" />
                    <span className="hidden sm:inline">로그인</span>
                  </Link>
                </Button>
              ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
