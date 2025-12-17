// src/lib/api-client.ts

type RefreshFunction = () => Promise<string | null>;
type GetTokenFunction = () => string | null;

class ApiClient {
  // Next.js API Route를 통해 프록시 (쿠키 기반 인증)
  private baseUrl = "/api";

  // Auth 핸들러 (useAuth에서 설정)
  private getAccessToken: GetTokenFunction = () => null;
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
      create: "/reservations",
      detail: (id: string) => `/reservations/${id}`,
      list: (reserverId: string) => `/reservations/${reserverId}/list`,
      cancel: (id: string) => `/reservations/${id}/cancel`,
      confirmed: (id: string) => `/reservations/${id}/confirmed`,
    },
    products: {
      list: "/products",
      detail: (id: number) => `/products/${id}`,
      create: "/products",
      update: (id: number) => `/products/${id}`,
      cancel: (id: number) => `/products/${id}`,
      submit: (id: number) => `/products/${id}/submit`,
      approve: (id: number) => `/products/${id}/approve`,
      reject: (id: number) => `/products/${id}/reject`,
      resubmit: (id: number) => `/products/${id}/resubmit`,
      schedule: (id: number) => `/products/${id}/schedule`,
      startSale: (id: number) => `/products/${id}/start-sale`,
      closeSale: (id: number) => `/products/${id}/close-sale`,
      complete: (id: number) => `/products/${id}/complete`,
    },
    venue: {
      artHalls: "/arthalls",
      artHallDetail: (id: number) => `/arthalls/${id}`,
      artHallStatus: (id: number) => `/arthalls/${id}/status`,
      stages: (artHallId: number) => `/arthalls/${artHallId}/stages`,
      stageDetail: (stageId: number) => `/arthalls/stages/${stageId}`,
      stageStatus: (stageId: number) => `/arthalls/stages/${stageId}/status`,
      stageSeats: (stageId: number) => `/arthalls/stages/${stageId}/stage-seats`,
      stageSeatDetail: (stageSeatId: number) => `/arthalls/stage-seats/${stageSeatId}`,
      stageSeatUpdate: (seatId: number) => `/arthalls/stages/stage-seats/${seatId}`,
      stageSeatStatus: "/arthalls/stages/stage-seats/status",
      stageSeatDelete: "/arthalls/stages/stage-seats",
    },
    reservationSeats: {
      create: "/reservation-seats",
      update: "/reservation-seats",
      list: (id: number) => `/products/${id}/reservation-seats`,
      preempt: (reservationSeatId: number) => `/reservation-seats/${reservationSeatId}/preempt`,
      reserve: (reservationSeatId: number) => `/reservation-seats/${reservationSeatId}/reserve`,
      cancel: (reservationSeatId: number) => `/reservation-seats/${reservationSeatId}/cancel`,
    },
  } as const;

  // ========================================
  // Auth 핸들러 설정 (useAuth에서 호출)
  // ========================================
  setAuthHandlers(handlers: {
    getAccessToken: GetTokenFunction;
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

  async delete<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.fetch(endpoint, {
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // ========================================
  // 핵심 fetch 로직 (401 자동 갱신)
  // ========================================
  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // 1차 요청
    let response = await this.doFetch(url, options);

    // 401이면 토큰 갱신 후 재시도
    if (response.status === 401) {
      const newToken = await this.refreshToken();

      if (newToken) {
        // 토큰 갱신 성공 → 재요청
        response = await this.doFetch(url, options);
      } else {
        // 갱신 실패 → 로그인 페이지로
        this.onAuthError();
        throw new AuthError("인증이 만료되었습니다.");
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(response.status, error.message || error.error || "요청 실패");
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
      credentials: "include",
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

// 백엔드 직접 호출용 (OAuth 등)
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
} as const;

export function getBackendUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

export function getOAuthLoginUrl(provider: string, rememberMe = false): string {
  return `${API_CONFIG.BASE_URL}/auth/oauth/${provider.toLowerCase()}?rememberMe=${rememberMe}`;
}