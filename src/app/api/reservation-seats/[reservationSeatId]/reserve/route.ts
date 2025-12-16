import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/reservation-seats/[reservationSeatId]/reserve - 좌석 예약 확정
 * 인증 필수
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ reservationSeatId: string }> }
) {
  try {
    const { reservationSeatId } = await params;
    const accessToken = await getAccessTokenFromRequest(request);

    if (!accessToken) {
      return NextResponse.json(
          { error: "로그인이 필요합니다." },
          { status: 401 }
      );
    }

    const response = await fetch(
        `${API_URL}/reservation-seats/${reservationSeatId}/reserve`,
        {
          method: "POST",
          headers: createAuthHeaders(accessToken),
        }
    );

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
          { error: data.message || "좌석 예약 확정에 실패했습니다." },
          { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: "좌석이 예약 확정되었습니다." });
  } catch (error) {
    console.error("ReservationSeat reserve error:", error);
    return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
    );
  }
}