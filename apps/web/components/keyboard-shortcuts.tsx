"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTheme } from "next-themes";

/**
 * 전역 키보드 단축키 핸들러
 */
export function KeyboardShortcuts() {
  const router = useRouter();
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: 검색 (향후 확장 가능)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toast.info("검색 기능은 곧 제공될 예정입니다.");
      }

      // Cmd/Ctrl + /: 단축키 도움말
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        showShortcutsHelp();
      }

      // Cmd/Ctrl + H: 홈으로
      if ((e.metaKey || e.ctrlKey) && e.key === "h") {
        e.preventDefault();
        router.push("/");
      }

      // Cmd/Ctrl + M: 내 신청 결과
      if ((e.metaKey || e.ctrlKey) && e.key === "m") {
        e.preventDefault();
        router.push("/my");
      }

      // Cmd/Ctrl + Shift + A: 관리자 페이지
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "A") {
        e.preventDefault();
        router.push("/admin");
      }

      // Cmd/Ctrl + Shift + D: 다크모드 토글
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setTheme(theme === "dark" ? "light" : "dark");
        toast.success(theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, theme, setTheme]);

  return null;
}

function showShortcutsHelp() {
  const isMac =
    typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const mod = isMac ? "Cmd" : "Ctrl";

  toast.info(
    <div className="space-y-2 text-sm">
      <div className="font-semibold mb-2">키보드 단축키</div>
      <div className="space-y-1">
        <div>
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">{mod} + H</kbd> 홈
        </div>
        <div>
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">{mod} + M</kbd> 내 신청 결과
        </div>
        <div>
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">{mod} + Shift + A</kbd> 관리자
        </div>
        <div>
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">{mod} + Shift + D</kbd> 다크모드
          토글
        </div>
      </div>
    </div>,
    { duration: 8000 }
  );
}
