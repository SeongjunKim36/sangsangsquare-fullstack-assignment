// ISO 날짜를 한국어 형식으로 변환
export function formatDateKorean(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();

  return `${year}년 ${month}월 ${day}일 ${hours}시`;
}

// 상대 시간 표시 (예: "3일 후", "2시간 전")
export function getRelativeTime(isoString: string): string {
  const now = new Date();
  const target = new Date(isoString);
  const diffMs = target.getTime() - now.getTime();
  const diffSeconds = Math.floor(Math.abs(diffMs) / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const suffix = diffMs > 0 ? "후" : "전";

  if (diffDays > 0) {
    return `${diffDays}일 ${suffix}`;
  }
  if (diffHours > 0) {
    return `${diffHours}시간 ${suffix}`;
  }
  if (diffMinutes > 0) {
    return `${diffMinutes}분 ${suffix}`;
  }
  return "방금";
}

// 발표일이 지났는지 확인
export function isAnnouncementPassed(isoString: string): boolean {
  return new Date(isoString) < new Date();
}

// 짧은 날짜 형식 (예: "03.20 12:00")
export function formatShortDate(isoString: string): string {
  const date = new Date(isoString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${month}.${day} ${hours}:${minutes}`;
}
