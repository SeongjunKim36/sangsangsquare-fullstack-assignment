/**
 * API 에러를 사용자 친화적인 메시지로 변환
 */
type ApiErrorLike = {
  code?: string;
  message?: string;
  response?: {
    status?: number;
    data?: {
      message?: string | string[];
      errors?: Record<string, string>;
    };
  };
};

export function getErrorMessage(error: unknown, defaultMessage: string): string {
  const apiError = error as ApiErrorLike;

  // 네트워크 에러
  if (!apiError.response) {
    if (apiError.code === "ERR_NETWORK") {
      return "네트워크 연결을 확인해주세요.";
    }
    if (apiError.message?.includes("timeout")) {
      return "요청 시간이 초과되었습니다. 다시 시도해주세요.";
    }
    return "네트워크 오류가 발생했습니다.";
  }

  const status = apiError.response?.status;
  const data = apiError.response?.data;

  // 서버에서 제공한 메시지 우선 사용
  if (data?.message) {
    if (Array.isArray(data.message)) {
      return data.message.join(", ");
    }
    return data.message;
  }

  // HTTP 상태 코드별 기본 메시지
  switch (status) {
    case 400:
      return "잘못된 요청입니다. 입력 내용을 확인해주세요.";
    case 401:
      return "인증이 필요합니다. 다시 로그인해주세요.";
    case 403:
      return "접근 권한이 없습니다.";
    case 404:
      return "요청하신 정보를 찾을 수 없습니다.";
    case 409:
      return "이미 처리된 요청입니다.";
    case 422:
      return "입력 값이 올바르지 않습니다.";
    case 429:
      return "너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.";
    case 500:
      return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    case 502:
    case 503:
      return "서버가 일시적으로 응답하지 않습니다. 잠시 후 다시 시도해주세요.";
    case 504:
      return "서버 응답 시간이 초과되었습니다. 다시 시도해주세요.";
    default:
      return defaultMessage;
  }
}

/**
 * 폼 유효성 검증 에러 처리
 */
export function getValidationErrors(error: unknown): Record<string, string> | null {
  const apiError = error as ApiErrorLike;

  if (apiError.response?.status === 422 && apiError.response?.data?.errors) {
    return apiError.response.data.errors;
  }
  return null;
}
