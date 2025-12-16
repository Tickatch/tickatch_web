import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/auth/oauth/[provider] - OAuth 로그인 시작
 * 인증 불필요
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const searchParams = request.nextUrl.searchParams;
    const rememberMe = searchParams.get("rememberMe") === "true";
    const userType = searchParams.get("userType") || "CUSTOMER";

    // 백엔드 OAuth URL로 리다이렉트 (userType 포함)
    const oauthUrl = `${API_URL}/auth/oauth/${provider}?rememberMe=${rememberMe}&userType=${userType}`;

    return NextResponse.redirect(oauthUrl);
  } catch (error) {
    console.error("OAuth redirect error:", error);
    return NextResponse.json(
        { error: "OAuth 리다이렉트에 실패했습니다." },
        { status: 500 }
    );
  }
}