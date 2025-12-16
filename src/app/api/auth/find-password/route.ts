import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/auth/find-password - 비밀번호 찾기 (재설정)
 * 인증 불필요
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newPassword, userType } = body;

    if (!email || !newPassword || !userType) {
      return NextResponse.json(
          { error: "이메일, 새 비밀번호, 사용자 유형은 필수입니다." },
          { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/auth/find-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword, userType }),
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
          { error: data.message || "비밀번호 변경에 실패했습니다." },
          { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: "비밀번호가 변경되었습니다." });
  } catch (error) {
    console.error("Find password error:", error);
    return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
    );
  }
}