import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * DELETE /api/auth/oauth/[provider]/unlink - 소셜 계정 연동 해제
 * 인증 필수
 */
export async function DELETE(
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

    const response = await fetch(`${API_URL}/auth/oauth/${provider}/unlink`, {
      method: "DELETE",
      headers: createAuthHeaders(accessToken),
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
          { error: data.message || "소셜 계정 연동 해제에 실패했습니다." },
          { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: "소셜 계정 연동이 해제되었습니다." });
  } catch (error) {
    console.error("OAuth unlink error:", error);
    return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
    );
  }
}