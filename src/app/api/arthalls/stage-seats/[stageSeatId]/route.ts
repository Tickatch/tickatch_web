import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/arthalls/stage-seats/[stageSeatId] - 좌석 상세 조회
 * 인증 선택
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ stageSeatId: string }> }
) {
  try {
    const { stageSeatId } = await params;
    const accessToken = await getAccessTokenFromRequest(request);

    const response = await fetch(`${API_URL}/arthalls/stage-seats/${stageSeatId}`, {
      headers: createAuthHeaders(accessToken),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
          { error: data.message || "좌석 조회에 실패했습니다." },
          { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Stage seat detail error:", error);
    return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
    );
  }
}