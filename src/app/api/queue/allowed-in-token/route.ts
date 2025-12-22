// app/api/queue/allowed-in-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAccessTokenFromRequest } from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * DELETE /api/queue/allowed-in-token
 * 예매 완료/취소 시 입장 토큰 무효화
 */
export async function DELETE(request: NextRequest) {
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
            error: { message: result.error?.message || "토큰 무효화 실패" },
          },
          { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Delete allowed-in-token error:", error);
    return NextResponse.json(
        { success: false, error: { message: "토큰 무효화 중 오류 발생" } },
        { status: 500 }
    );
  }
}