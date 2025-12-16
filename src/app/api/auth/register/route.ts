import { NextRequest, NextResponse } from "next/server";
import { getTokenNames, getTokenRemainingSeconds } from "@/lib/auth-utils";
import { UserType } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/auth/register - 회원가입
 * 인증 불필요
 * 회원가입 성공 시 유저 타입별 토큰 저장
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userAgent = request.headers.get("user-agent") || "Unknown";

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
          { error: data.message || "회원가입에 실패했습니다." },
          { status: response.status }
      );
    }

    // 회원가입 성공 시 자동 로그인 (유저 타입별 토큰 쿠키 설정)
    const res = NextResponse.json(data);
    const isProduction = process.env.NODE_ENV === "production";

    // 유저 타입에 맞는 쿠키 이름 가져오기
    const userType = (data.userType as UserType) || "CUSTOMER";
    const tokenNames = getTokenNames(userType);

    const accessTokenMaxAge = getTokenRemainingSeconds(data.accessToken) || 5 * 60;
    const refreshTokenMaxAge = 7 * 24 * 60 * 60;

    // 유저 타입별 토큰 저장
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

    // 해당 유저 타입 로그인 상태 표시
    res.cookies.set(`logged_in_${userType.toLowerCase()}`, "true", {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: refreshTokenMaxAge,
    });

    return res;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
    );
  }
}