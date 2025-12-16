import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/products/[id]/reservation-seats - 상품의 예매 좌석 목록 조회
 * 인증 선택 (토큰 있으면 전달)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const accessToken = await getAccessTokenFromRequest(request);

    const response = await fetch(
        `${API_URL}/products/${productId}/reservation-seats`,
        {
          headers: createAuthHeaders(accessToken),
          cache: "no-store",
        }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
          { error: data.message || "예매 좌석 목록 조회에 실패했습니다." },
          { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("ReservationSeats list error:", error);
    return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
    );
  }
}