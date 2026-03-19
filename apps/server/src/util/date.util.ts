/**
 * 날짜 관련 유틸리티 함수
 */

/**
 * 발표일이 지났는지 확인
 * @param announcementAt 발표일
 * @returns 발표일이 지났으면 true
 */
export function isAnnouncementPassed(announcementAt: Date): boolean {
  return new Date() >= new Date(announcementAt);
}

/**
 * 현재 서버 시간 기준 날짜를 반환
 * @returns 현재 Date 객체
 */
export function getCurrentServerTime(): Date {
  return new Date();
}
