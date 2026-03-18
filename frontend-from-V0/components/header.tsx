"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUserName, setUserName } from "@/lib/user-store";
import { toast } from "sonner";
import { User, ClipboardList, Settings, Check, Pencil } from "lucide-react";

export function Header() {
  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const savedName = getUserName();
    setName(savedName);
    setInputValue(savedName);
  }, []);

  const handleSave = () => {
    if (!inputValue.trim()) {
      toast.error("이름을 입력해주세요.");
      return;
    }
    setUserName(inputValue.trim());
    setName(inputValue.trim());
    setIsEditing(false);
    toast.success("이름이 저장되었습니다.");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setInputValue(name);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        {/* 로고 및 타이틀 */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity"
        >
          <span className="hidden sm:inline">상상단 단톡방 모임</span>
          <span className="sm:hidden">상상단 모임</span>
        </Link>

        {/* 우측 영역 */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* 사용자 이름 입력/표시 */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <Input
                  type="text"
                  placeholder="이름 입력"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-8 w-24 sm:w-32 text-sm"
                  autoFocus
                  aria-label="사용자 이름 입력"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSave}
                  className="h-8 px-2"
                  aria-label="이름 저장"
                >
                  <Check className="size-4" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                aria-label="이름 수정"
              >
                <User className="size-4" />
                <span className="max-w-20 truncate">
                  {name || "이름 입력"}
                </span>
                <Pencil className="size-3 opacity-50" />
              </button>
            )}
          </div>

          {/* 네비게이션 링크 */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="/my"
                className="flex items-center gap-1"
                aria-label="내 신청 결과 페이지로 이동"
              >
                <ClipboardList className="size-4" />
                <span className="hidden sm:inline">내 신청 결과</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link
                href="/admin"
                className="flex items-center gap-1"
                aria-label="관리자 페이지로 이동"
              >
                <Settings className="size-4" />
                <span className="hidden sm:inline">관리자</span>
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
