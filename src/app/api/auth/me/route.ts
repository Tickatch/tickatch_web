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

    // Referer에서 현재 경로 추출 (어느 페이지에서 요청했는지)
    const referer = request.headers.get("referer") || "";
    const url = new URL(referer, request.url);
    const pathname = url.pathname;

    // 경로 기반으로 userType 결정
    const userType = getUserTypeFromPath(pathname);
    const tokenNames = TOKEN_NAMES[userType];

    const accessToken = cookieStore.get(tokenNames.accessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({
        user: null,
        userType: null,
        isAuthenticated: false,
      });
    }

    // 사용자 정보 조회
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      return NextResponse.json({
        user: null,
        userType: null,
        isAuthenticated: false,
      });
    }

    const user = await response.json();
    return NextResponse.json({
      user: user.data || user,
      userType,
      isAuthenticated: true,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({
      user: null,
      userType: null,
      isAuthenticated: false,
    });
  }
}