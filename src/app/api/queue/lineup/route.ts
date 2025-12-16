import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/queue/lineup - 대기열 등록
 * 인증 필수
 */
export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessTokenFromRequest(request);

    if (!accessToken) {
      return NextResponse.json(
          { success: false, error: { message: "로그인이 필요합니다." } },
          { status: 401 }
      );
    }

    const res = await fetch(`${API_URL}/queue/lineup`, {
      method: "POST",
      headers: createAuthHeaders(accessToken),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Queue lineup error:", error);
    return NextResponse.json(
        { success: false, error: { message: "대기열 등록 중 오류 발생" } },
        { status: 500 }
    );
  }
}