import { NextRequest, NextResponse } from "next/server";
import { getTokenNames, getTokenRemainingSeconds } from "@/lib/auth-utils";
import { UserType } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

/**
 * GET /api/auth/oauth/[provider]/callback - OAuth 콜백 처리
 * 유저 타입별 토큰 저장
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // 사용자가 로그인 취소
    if (error) {
      return NextResponse.redirect(
          `${FRONTEND_URL}/oauth/callback?error=${encodeURIComponent("로그인이 취소되었습니다.")}`
      );
    }

    // 인가 코드 필수
    if (!code) {
      return NextResponse.redirect(
          `${FRONTEND_URL}/oauth/callback?error=${encodeURIComponent("인증 코드가 유효하지 않습니다.")}`
      );
    }

    // 백엔드로 콜백 전달
    const callbackUrl = new URL(`${API_URL}/auth/oauth/${provider}/callback`);
    callbackUrl.searchParams.set("code", code);
    if (state) {
      callbackUrl.searchParams.set("state", state);
    }

    const response = await fetch(callbackUrl.toString(), {
      method: "GET",
      redirect: "manual",
    });

    // 백엔드가 리다이렉트 응답을 보냄
    const redirectUrl = response.headers.get("location");

    if (redirectUrl) {
      const url = new URL(redirectUrl);
      const success = url.searchParams.get("success");
      const data = url.searchParams.get("data");
      const errorMsg = url.searchParams.get("error");

      if (success === "true" && data) {
        // 로그인 성공 - 토큰을 쿠키에 저장
        try {
          const loginResponse = JSON.parse(decodeURIComponent(data));

          // 유저 타입에 맞는 쿠키 이름 가져오기
          const userType = (loginResponse.userType as UserType) || "CUSTOMER";
          const tokenNames = getTokenNames(userType);

          const res = NextResponse.redirect(`${FRONTEND_URL}/oauth/callback?success=true`);
          const isProduction = process.env.NODE_ENV === "production";

          const accessTokenMaxAge = getTokenRemainingSeconds(loginResponse.accessToken) || 5 * 60;
          const refreshTokenMaxAge = 7 * 24 * 60 * 60;

          // 유저 타입별 토큰 저장
          res.cookies.set(tokenNames.accessToken, loginResponse.accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            path: "/",
            maxAge: accessTokenMaxAge,
          });

          res.cookies.set(tokenNames.refreshToken, loginResponse.refreshToken, {
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
        } catch (parseError) {
          console.error("Failed to parse login response:", parseError);
          return NextResponse.redirect(
              `${FRONTEND_URL}/oauth/callback?error=${encodeURIComponent("로그인 처리 중 오류가 발생했습니다.")}`
          );
        }
      }

      if (errorMsg) {
        return NextResponse.redirect(
            `${FRONTEND_URL}/oauth/callback?error=${encodeURIComponent(errorMsg)}`
        );
      }
    }

    // 예상치 못한 응답
    return NextResponse.redirect(
        `${FRONTEND_URL}/oauth/callback?error=${encodeURIComponent("인증 처리 중 오류가 발생했습니다.")}`
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
        `${FRONTEND_URL}/oauth/callback?error=${encodeURIComponent("서버 오류가 발생했습니다.")}`
    );
  }
}