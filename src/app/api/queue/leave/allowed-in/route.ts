// app/api/queue/leave/allowed-in/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAccessTokenFromRequest } from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/queue/leave/allowed-in
 * sendBeacon용 - 예매 페이지 이탈 시 입장 토큰 삭제
 * 내부적으로 DELETE /api/v1/queue/allowed-in-token 호출
 */
export async function POST(request: NextRequest) {
  const accessToken = await getAccessTokenFromRequest(request);

  if (!accessToken) {
    return NextResponse.json(
        { success: false, error: { message: "로그인이 필요합니다." } },
        { status: 401 }
    );
  }

  try {
    const response = await fetch(`${API_URL}/queue/allowed-in-token`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
          {
            success: false,
            error: { message: result.error?.message || "토큰 삭제 실패" },
          },
          { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Leave allowed-in error:", error);
    return NextResponse.json(
        { success: false, error: { message: "토큰 삭제 중 오류 발생" } },
        { status: 500 }
    );
  }
}