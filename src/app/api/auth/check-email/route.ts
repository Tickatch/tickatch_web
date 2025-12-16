import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/auth/check-email - 이메일 중복 확인
 * 인증 불필요
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/auth/check-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
          { error: data.message || "이메일 확인에 실패했습니다." },
          { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Check email error:", error);
    return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
    );
  }
}