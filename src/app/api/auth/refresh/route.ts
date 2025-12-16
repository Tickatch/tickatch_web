import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getUserTypeFromRequest,
  getTokenRemainingSeconds,
  TOKEN_NAMES,
} from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/auth/refresh - 토큰 갱신
 * 경로 기반으로 유저 타입 결정 후 해당 리프레시 토큰 사용
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userType = await getUserTypeFromRequest(request);
    const tokenNames = TOKEN_NAMES[userType];

    // body에서 refreshToken 가져오거나 쿠키에서 가져오기
    let refreshToken: string | undefined;

    try {
      const body = await request.json();
      refreshToken = body.refreshToken;
    } catch {
      // body가 없을 수 있음
    }

    if (!refreshToken) {
      refreshToken = cookieStore.get(tokenNames.refreshToken)?.value;
    }

    if (!refreshToken) {
      return NextResponse.json(
          { error: "Refresh Token이 없습니다." },
          { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      // 갱신 실패 시 해당 유저 타입 쿠키만 삭제
      const res = NextResponse.json(
          { error: data.message || "토큰 갱신에 실패했습니다." },
          { status: response.status }
      );
      res.cookies.delete(tokenNames.accessToken);
      res.cookies.delete(tokenNames.refreshToken);
      res.cookies.delete(`logged_in_${userType.toLowerCase()}`);
      return res;
    }

    // 새 토큰을 해당 유저 타입 쿠키에 저장
    const res = NextResponse.json(data);
    const isProduction = process.env.NODE_ENV === "production";

    const accessTokenMaxAge = getTokenRemainingSeconds(data.accessToken) || 5 * 60;
    const refreshTokenMaxAge = 7 * 24 * 60 * 60;

    res.cookies.set(tokenNames.accessToken, data.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: accessTokenMaxAge,
    });

    res.cookies.set(tokenNames.refreshToken, data.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: refreshTokenMaxAge,
    });

    return res;
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
    );
  }
}