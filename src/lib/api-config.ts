// API 설정
export const API_CONFIG = {
  // 백엔드 API 기본 URL
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",

  // 엔드포인트
  ENDPOINTS: {
    // Auth
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    CHECK_EMAIL: "/auth/check-email",
    CHANGE_PASSWORD: "/auth/password",
    WITHDRAW: "/auth/withdraw",

    // OAuth
    OAUTH_LOGIN: (provider: string) => `/auth/oauth/${provider}`,
    OAUTH_CALLBACK: (provider: string) => `/auth/oauth/${provider}/callback`,
    OAUTH_LINK: (provider: string) => `/auth/oauth/${provider}/link`,
    OAUTH_UNLINK: (provider: string) => `/auth/oauth/${provider}/unlink`,
  },
} as const;

// API URL 생성 헬퍼
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// OAuth 로그인 URL 생성
export function getOAuthLoginUrl(
  provider: string,
  rememberMe: boolean = false
): string {
  return `${
    API_CONFIG.BASE_URL
  }/auth/oauth/${provider.toLowerCase()}?rememberMe=${rememberMe}`;
}
