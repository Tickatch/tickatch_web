// src/lib/api-client.ts
type RefreshFunction = () => Promise<string | null>;

class ApiClient {
  private baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

  private getAccessToken: () => string | null = () => null;
  private refreshToken: RefreshFunction = async () => null;
  private onAuthError: () => void = () => {};

  // ========================================
  // 엔드포인트 상수
  // ========================================
  readonly endpoints = {
    auth: {
      login: "/auth/login",
      register: "/auth/register",
      logout: "/auth/logout",
      refresh: "/auth/refresh",
      me: "/auth/me",
      checkEmail: "/auth/check-email",
      changePassword: "/auth/password",
      withdraw: "/auth/withdraw",
    },
    oauth: {
      login: (provider: string) => `/auth/oauth/${provider}`,
      callback: (provider: string) => `/auth/oauth/${provider}/callback`,
      link: (provider: string) => `/auth/oauth/${provider}/link`,
      unlink: (provider: string) => `/auth/oauth/${provider}/unlink`,
    },
    reservations: {
      my: "/reservations/my",
      detail: (id: string) => `/reservations/${id}`,
    },
    // 필요한 엔드포인트 추가...
  } as const;

  // ========================================
  // Auth 핸들러 설정 (AuthProvider에서 호출)
  // ========================================
  setAuthHandlers(handlers: {
    getAccessToken: () => string | null;
    refreshToken: RefreshFunction;
    onAuthError: () => void;
  }) {
    this.getAccessToken = handlers.getAccessToken;
    this.refreshToken = handlers.refreshToken;
    this.onAuthError = handlers.onAuthError;
  }

  // ========================================
  // HTTP 메서드
  // ========================================
  async get<T>(endpoint: string): Promise<T> {
    return this.fetch(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.fetch(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.fetch(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.fetch(endpoint, { method: "DELETE" });
  }

  // ========================================
  // 핵심 fetch 로직 (401 자동 갱신)
  // ========================================
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // 첫 번째 시도
    let response = await this.doFetch(url, options);

    // 401이면 토큰 갱신 후 재시도
    if (response.status === 401) {
      const newToken = await this.refreshToken();

      if (newToken) {
        response = await this.doFetch(url, options);
      } else {
        this.onAuthError();
        throw new AuthError("인증이 만료되었습니다.");
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(response.status, error.message || "요청 실패");
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private async doFetch(url: string, options: RequestInit): Promise<Response> {
    const accessToken = this.getAccessToken();

    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
    });
  }

  // ========================================
  // 헬퍼 함수
  // ========================================
  getOAuthLoginUrl(provider: string, rememberMe = false): string {
    return `${
      this.baseUrl
    }/auth/oauth/${provider.toLowerCase()}?rememberMe=${rememberMe}`;
  }

  getFullUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }
}

// 에러 클래스
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

// 싱글톤 export
export const api = new ApiClient();

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  ENDPOINTS: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    CHECK_EMAIL: "/auth/check-email",
    CHANGE_PASSWORD: "/auth/password",
    WITHDRAW: "/auth/withdraw",
    OAUTH_LOGIN: (provider: string) => `/auth/oauth/${provider}`,
    OAUTH_CALLBACK: (provider: string) => `/auth/oauth/${provider}/callback`,
    OAUTH_LINK: (provider: string) => `/auth/oauth/${provider}/link`,
    OAUTH_UNLINK: (provider: string) => `/auth/oauth/${provider}/unlink`,
    productList: `/products`,
  },
} as const;

export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

export function getOAuthLoginUrl(provider: string, rememberMe = false): string {
  return `${
    API_CONFIG.BASE_URL
  }/auth/oauth/${provider.toLowerCase()}?rememberMe=${rememberMe}`;
}
