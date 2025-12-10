// 사용자 유형
export type UserType = "CUSTOMER" | "SELLER" | "ADMIN";

// 계정 상태
export type AuthStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

// OAuth 제공자
export type ProviderType = "KAKAO" | "NAVER" | "GOOGLE";

// 로그인 요청
export interface LoginRequest {
  email: string;
  password: string;
  userType: UserType;
  rememberMe: boolean;
}

// 로그인 응답
export interface LoginResponse {
  authId: string;
  email: string;
  userType: UserType;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

// 사용자 정보
export interface AuthInfo {
  id: string;
  email: string;
  userType: UserType;
  status: AuthStatus;
  lastLoginAt: string | null;
  providers: ProviderType[];
  createdAt: string;
}

// 알림
export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

// 인증 상태
export interface AuthState {
  isAuthenticated: boolean;
  user: AuthInfo | null;
  userType: UserType | null;
}
