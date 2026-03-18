"use client";

/**
 * 스크린 리더 사용자를 위한 Skip to Content 링크
 * 키보드로 탐색 시 메인 콘텐츠로 바로 이동할 수 있게 함
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
    >
      메인 콘텐츠로 건너뛰기
    </a>
  );
}
