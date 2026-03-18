import axios, { type AxiosInstance } from "axios";

/**
 * API 클라이언트 기본 설정
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// 전역 토큰 저장소 (메모리)
let authToken: string | null = null;

/**
 * 공유 Axios Instance 생성
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request 인터셉터: Bearer Token 자동 주입
  instance.interceptors.request.use(
    (config) => {
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response 인터셉터: 에러 처리
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // 401 에러 시 토큰 제거 등 추가 처리 가능
      if (error.response?.status === 401) {
        authToken = null;
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// 전역 공유 axios instance
export const apiInstance = createAxiosInstance();

/**
 * Bearer Token 설정
 * 로그인 성공 시 호출
 */
export const setAuthToken = (token: string): void => {
  authToken = token;
};

/**
 * Bearer Token 제거
 * 로그아웃 시 호출
 */
export const clearAuthToken = (): void => {
  authToken = null;
};

/**
 * 현재 Token 조회
 */
export const getAuthToken = (): string | null => {
  return authToken;
};

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
