// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { TOKEN_NAMES, getUserTypeFromPath } from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/auth/me - 현재 사용자 정보 조회
 * 경로 기반으로 유저 타입 결정 후 해당 토큰 사용
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // X-Current-Path 헤더 우선, 없으면 Referer에서 추출
    let pathname = request.headers.get("x-current-path") || "";

    if (!pathname) {
      const referer = request.headers.get("referer") || "";
      try {
        const url = new URL(referer, request.url);
        pathname = url.pathname;
      } catch {
        pathname = "/";
      }
    }

    // 경로 기반으로 userType 결정
    const userType = getUserTypeFromPath(pathname);
    const tokenNames = TOKEN_NAMES[userType];

    const accessToken = cookieStore.get(tokenNames.accessToken)?.value;

    if (!accessToken) {
      // 토큰이 없으면 401 반환 (refresh 시도 유도)
      return NextResponse.json(
          { user: null, userType: null, isAuthenticated: false },
          { status: 401 }
      );
    }

    // 사용자 정보 조회
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      // 토큰이 유효하지 않으면 401 반환
      return NextResponse.json(
          { user: null, userType: null, isAuthenticated: false },
          { status: 401 }
      );
    }

    const user = await response.json();
    return NextResponse.json({
      user: user.data || user,
      userType,
      isAuthenticated: true,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
        { user: null, userType: null, isAuthenticated: false },
        { status: 500 }
    );
  }
}