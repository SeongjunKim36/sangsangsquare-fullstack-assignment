// 간단한 사용자 저장소 (클라이언트 전용)
// 실제 서비스에서는 인증 시스템으로 대체됨

const USER_NAME_KEY = "sangsangdan_user_name";
const VIEWER_ID_KEY = "sangsangdan_viewer_id";

export function getViewerId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const existingViewerId = localStorage.getItem(VIEWER_ID_KEY);
  if (existingViewerId) {
    return existingViewerId;
  }

  const nextViewerId = `viewer-${crypto.randomUUID()}`;
  localStorage.setItem(VIEWER_ID_KEY, nextViewerId);
  return nextViewerId;
}

export function getUserName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(USER_NAME_KEY) || "";
}

export function getViewerIdentity() {
  return {
    viewerId: getViewerId(),
    userName: getUserName(),
  };
}

export function setUserName(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_NAME_KEY, name);
}

export function clearUserName(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_NAME_KEY);
}
