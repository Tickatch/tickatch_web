import { NextRequest, NextResponse } from "next/server";
import { getTokenNames, getTokenRemainingSeconds } from "@/lib/auth-utils";
import { UserType } from "@/types/auth";

/**
 * POST /api/auth/session - 세션 저장 (토큰을 쿠키에 저장)
 * 클라이언트에서 토큰을 받아서 유저 타입별 쿠키에 저장
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, refreshToken, userType } = body;

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
          { error: "토큰이 필요합니다." },
          { status: 400 }
      );
    }

    const response = NextResponse.json({ success: true });
    const isProduction = process.env.NODE_ENV === "production";

    // 유저 타입에 맞는 쿠키 이름 가져오기
    const resolvedUserType = (userType as UserType) || "CUSTOMER";
    const tokenNames = getTokenNames(resolvedUserType);

    // JWT에서 exp 추출해서 남은 시간 계산
    const accessTokenMaxAge = getTokenRemainingSeconds(accessToken) || 5 * 60;
    const refreshTokenMaxAge = 7 * 24 * 60 * 60;

    // 유저 타입별 토큰 저장
    response.cookies.set(tokenNames.accessToken, accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: accessTokenMaxAge,
    });

    response.cookies.set(tokenNames.refreshToken, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: refreshTokenMaxAge,
    });

    // 해당 유저 타입 로그인 상태 표시
    response.cookies.set(`logged_in_${resolvedUserType.toLowerCase()}`, "true", {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: refreshTokenMaxAge,
    });

    return response;
  } catch (error) {
    console.error("Session save error:", error);
    return NextResponse.json(
        { error: "Failed to save session" },
        { status: 500 }
    );
  }
}