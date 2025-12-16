import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  getUserTypeFromRequest,
  createAuthHeaders,
  TOKEN_NAMES,
} from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * DELETE /api/auth/withdraw - 회원 탈퇴
 * 인증 필수
 * 탈퇴 후 해당 유저 타입 토큰만 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const accessToken = await getAccessTokenFromRequest(request);
    const userType = await getUserTypeFromRequest(request);

    if (!accessToken) {
      return NextResponse.json(
          { error: "로그인이 필요합니다." },
          { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${API_URL}/auth/withdraw`, {
      method: "DELETE",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
          { error: data.message || "회원탈퇴에 실패했습니다." },
          { status: response.status }
      );
    }

    // 탈퇴 후 해당 유저 타입 쿠키만 삭제
    const res = NextResponse.json({ success: true, message: "회원탈퇴가 완료되었습니다." });
    const tokenNames = TOKEN_NAMES[userType];

    res.cookies.delete(tokenNames.accessToken);
    res.cookies.delete(tokenNames.refreshToken);
    res.cookies.delete(`logged_in_${userType.toLowerCase()}`);

    return res;
  } catch (error) {
    console.error("Withdraw error:", error);
    return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
    );
  }
}