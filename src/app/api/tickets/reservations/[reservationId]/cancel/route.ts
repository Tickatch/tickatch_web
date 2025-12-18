import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/tickets/reservations/[reservationId]/cancel - 예매 취소로 인한 티켓 취소
 * 백엔드: POST /api/v1/tickets/reservations/{reservationId}/cancel
 * Response: ApiResponse<void>
 * 인증 필수
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ reservationId: string }> }
) {
  try {
    const { reservationId } = await params;
    const accessToken = await getAccessTokenFromRequest(request);

    if (!accessToken) {
      return NextResponse.json(
          { success: false, error: { message: "로그인이 필요합니다." } },
          { status: 401 }
      );
    }

    const response = await fetch(
        `${API_URL}/tickets/reservations/${reservationId}/cancel`,
        {
          method: "POST",
          headers: createAuthHeaders(accessToken),
        }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
          {
            success: false,
            error: {
              message:
                  data.error?.message ||
                  data.message ||
                  "예매 취소로 인한 티켓 취소에 실패했습니다.",
            },
          },
          { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: "티켓이 취소되었습니다." });
  } catch (error) {
    console.error("Ticket cancel by reservation error:", error);
    return NextResponse.json(
        { success: false, error: { message: "서버 오류가 발생했습니다." } },
        { status: 500 }
    );
  }
}