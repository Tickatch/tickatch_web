import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/auth/oauth/[provider]/link - 소셜 계정 연동
 * 인증 필수
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const accessToken = await getAccessTokenFromRequest(request);

    if (!accessToken) {
      return NextResponse.json(
          { error: "로그인이 필요합니다." },
          { status: 401 }
      );
    }

    // 백엔드 소셜 연동 URL로 리다이렉트
    const linkUrl = `${API_URL}/auth/oauth/${provider}/link`;

    const response = await fetch(linkUrl, {
      method: "GET",
      headers: createAuthHeaders(accessToken),
      redirect: "manual",
    });

    const redirectUrl = response.headers.get("location");

    if (redirectUrl) {
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.json(
        { error: "소셜 계정 연동에 실패했습니다." },
        { status: 500 }
    );
  } catch (error) {
    console.error("OAuth link error:", error);
    return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
    );
  }
}