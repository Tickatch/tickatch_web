// src/lib/auth-utils.ts
import { cookies } from "next/headers";
import { UserType } from "@/types/auth";

// 유저 타입별 쿠키 이름 매핑
export const TOKEN_NAMES = {
  CUSTOMER: {
    accessToken: "access_token",
    refreshToken: "refresh_token",
  },
  SELLER: {
    accessToken: "seller_access_token",
    refreshToken: "seller_refresh_token",
  },
  ADMIN: {
    accessToken: "admin_access_token",
    refreshToken: "admin_refresh_token",
  },
} as const;

/**
 * 경로에서 유저 타입 추론
 */
export function getUserTypeFromPath(pathname: string): UserType {
  if (pathname.startsWith("/admin")) return "ADMIN";
  if (pathname.startsWith("/seller")) return "SELLER";
  return "CUSTOMER";
}

/**
 * 유저 타입에 맞는 토큰 이름 가져오기
 */
export function getTokenNames(userType: UserType) {
  return TOKEN_NAMES[userType];
}

/**
 * Request에서 현재 경로 추출 (Referer 또는 X-Current-Path 헤더 사용)
 */
export function getPathFromRequest(request: Request): string {
  // 1. X-Current-Path 헤더 확인 (클라이언트에서 명시적으로 보낸 경우)
  const currentPath = request.headers.get("x-current-path");
  if (currentPath) return currentPath;

  // 2. Referer 헤더에서 추출
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      return url.pathname;
    } catch {
      // URL 파싱 실패 시 무시
    }
  }

  // 3. 기본값: CUSTOMER
  return "/";
}

/**
 * Request에서 유저 타입 추론
 */
export function getUserTypeFromRequest(request: Request): UserType {
  const pathname = getPathFromRequest(request);
  return getUserTypeFromPath(pathname);
}

/**
 * Request에서 적절한 토큰 가져오기
 * - 경로 기반으로 유저 타입 결정
 * - 해당 유저 타입의 토큰 반환
 */
export async function getAccessTokenFromRequest(request: Request): Promise<string | null> {
  const cookieStore = await cookies();
  const userType = getUserTypeFromRequest(request);
  const tokenNames = getTokenNames(userType);

  return cookieStore.get(tokenNames.accessToken)?.value || null;
}

/**
 * Request에서 리프레시 토큰 가져오기
 */
export async function getRefreshTokenFromRequest(request: Request): Promise<string | null> {
  const cookieStore = await cookies();
  const userType = getUserTypeFromRequest(request);
  const tokenNames = getTokenNames(userType);

  return cookieStore.get(tokenNames.refreshToken)?.value || null;
}

/**
 * JWT에서 만료시간 추출
 */
export function getTokenRemainingSeconds(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString());
    const remaining = decoded.exp - Math.floor(Date.now() / 1000);
    return remaining > 0 ? remaining : 0;
  } catch {
    return null;
  }
}

/**
 * API 요청 헤더 생성 (토큰이 있으면 포함)
 */
export function createAuthHeaders(accessToken: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return headers;
}