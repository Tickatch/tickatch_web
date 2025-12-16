import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * PUT /api/arthalls/stages/stage-seats/[seatId] - 좌석 위치 수정
 * 인증 필수
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ seatId: string }> }
) {
  try {
    const { seatId } = await params;
    const accessToken = await getAccessTokenFromRequest(request);

    if (!accessToken) {
      return NextResponse.json(
          { error: "로그인이 필요합니다." },
          { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${API_URL}/arthalls/stages/stage-seats/${seatId}`, {
      method: "PUT",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
          { error: data.message || "좌석 수정에 실패했습니다." },
          { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Stage seat update error:", error);
    return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
    );
  }
}