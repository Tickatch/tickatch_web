/**
 * 인증 관련 타입 정의 (백엔드 Auth Service와 동기화)
 */

// ========== Enums ==========

/** 사용자 유형 */
export type UserType = "CUSTOMER" | "SELLER" | "ADMIN";

/** 계정 상태 */
export type AuthStatus = "ACTIVE" | "LOCKED" | "WITHDRAWN";

/** OAuth 제공자 */
export type ProviderType = "KAKAO" | "NAVER" | "GOOGLE";

// ========== Request DTOs ==========

/** 로그인 요청 */
export interface LoginRequest {
  email: string;
  password: string;
  userType: UserType;
  rememberMe: boolean;
}

/** 회원가입 요청 */
export interface RegisterRequest {
  email: string;
  password: string;
  userType: UserType;
  rememberMe: boolean;
}

/** 비밀번호 변경 요청 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/** 이메일 중복 확인 요청 */
export interface CheckEmailRequest {
  email: string;
  userType: UserType;
}

/** 로그아웃 요청 */
export interface LogoutRequest {
  refreshToken?: string;
  allDevices: boolean;
}

/** 토큰 갱신 요청 */
export interface RefreshRequest {
  refreshToken: string;
}

/** 회원탈퇴 요청 */
export interface WithdrawRequest {
  password: string;
}

/** OAuth 로그인 요청 (쿼리 파라미터) */
export interface OAuthLoginRequest {
  userType: UserType;
  rememberMe: boolean;
}

// ========== Response DTOs ==========

/** 로그인 응답 */
export interface LoginResponse {
  authId: string;
  email: string;
  userType: UserType;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

/** 이메일 중복 확인 응답 */
export interface CheckEmailResponse {
  available: boolean;
}

// ========== 사용자 정보 ==========

/** 사용자 정보 (내 정보 조회 응답) */
export interface AuthInfo {
  id: string;
  email: string;
  userType: UserType;
  status: AuthStatus;
  lastLoginAt: string | null;
  providers: ProviderType[];
  createdAt: string;
}

// ========== 알림 ==========

/** 알림 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

// ========== 프론트엔드 상태 ==========

/** 인증 상태 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthInfo | null;
  userType: UserType | null;
}

// ========== API 응답 래퍼 ==========

/** API 성공 응답 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/** API 에러 응답 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/** API 응답 (성공 또는 에러) */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ========== 라벨 매핑 ==========

export const USER_TYPE_LABELS: Record<UserType, string> = {
  CUSTOMER: "구매자",
  SELLER: "판매자",
  ADMIN: "관리자",
};

export const AUTH_STATUS_LABELS: Record<AuthStatus, string> = {
  ACTIVE: "활성",
  LOCKED: "잠금",
  WITHDRAWN: "탈퇴",
};

export const PROVIDER_TYPE_LABELS: Record<ProviderType, string> = {
  KAKAO: "카카오",
  NAVER: "네이버",
  GOOGLE: "구글",
};

// ========== 유틸리티 ==========

/** 사용자 유형별 리다이렉트 경로 */
export function getRedirectPathByUserType(userType: UserType): string {
  switch (userType) {
    case "CUSTOMER": return "/";
    case "SELLER": return "/seller";
    case "ADMIN": return "/admin";
  }
}

/** 사용자 유형별 로그인 경로 */
export function getLoginPathByUserType(userType: UserType): string {
  switch (userType) {
    case "CUSTOMER": return "/login";
    case "SELLER": return "/seller/login";
    case "ADMIN": return "/admin/login";
  }
}