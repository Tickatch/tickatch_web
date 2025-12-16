// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTokenNames, getTokenRemainingSeconds } from "@/lib/auth-utils";
import { UserType } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/auth/login - 로그인
 * 인증 불필요
 * 유저 타입별 토큰 저장
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userAgent = request.headers.get("user-agent") || "Unknown";

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify(body),
    });

    const apiResponse = await response.json();

    if (!response.ok || !apiResponse.success) {
      return NextResponse.json(
          {
            success: false,
            error: apiResponse.error?.message || "로그인에 실패했습니다.",
          },
          { status: response.status }
      );
    }

    const loginData = apiResponse.data;

    if (!loginData || !loginData.accessToken) {
      return NextResponse.json(
          { success: false, error: "로그인 응답이 올바르지 않습니다." },
          { status: 500 }
      );
    }

    // 성공 응답
    const res = NextResponse.json({
      success: true,
      data: loginData,
    });

    // 유저 타입에 맞는 쿠키 이름 가져오기
    const userType = loginData.userType as UserType;
    const tokenNames = getTokenNames(userType);

    const isProduction = process.env.NODE_ENV === "production";
    const accessTokenMaxAge = getTokenRemainingSeconds(loginData.accessToken) || 5 * 60;
    const refreshTokenMaxAge = 7 * 24 * 60 * 60;

    // 유저 타입별 토큰 저장
    res.cookies.set(tokenNames.accessToken, loginData.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: accessTokenMaxAge,
    });

    res.cookies.set(tokenNames.refreshToken, loginData.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: refreshTokenMaxAge,
    });

    // 해당 유저 타입 로그인 상태 표시 (클라이언트에서 확인용)
    res.cookies.set(`logged_in_${userType.toLowerCase()}`, "true", {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: refreshTokenMaxAge,
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
        { success: false, error: "서버 오류가 발생했습니다." },
        { status: 500 }
    );
  }
}