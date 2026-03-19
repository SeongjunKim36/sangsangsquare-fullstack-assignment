import axios, { type AxiosInstance } from "axios";

/**
 * API 클라이언트 기본 설정
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/**
 * 공유 Axios Instance 생성
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    withCredentials: true, // 세션 쿠키 전송
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Response 인터셉터: 에러 처리
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
};

// 전역 공유 axios instance
export const apiInstance = createAxiosInstance();

/**
 * Base API Client
 * 모든 API 클라이언트가 상속받아 사용
 */
export class BaseApiClient {
  protected api: AxiosInstance;

  constructor() {
    this.api = apiInstance;
  }
}
