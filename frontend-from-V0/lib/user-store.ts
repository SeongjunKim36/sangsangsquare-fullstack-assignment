// 간단한 사용자 이름 저장소 (클라이언트 전용)
// 실제 서비스에서는 인증 시스템으로 대체됨

const USER_NAME_KEY = "sangsangdan_user_name";

export function getUserName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(USER_NAME_KEY) || "";
}

export function setUserName(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_NAME_KEY, name);
}

export function clearUserName(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_NAME_KEY);
}
