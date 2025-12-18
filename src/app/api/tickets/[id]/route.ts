import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/tickets/[id] - 티켓 상세 조회
 * 백엔드: GET /api/v1/tickets/{id}
 * Response: ApiResponse<TicketDetailResponse>
 * 인증 필수
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accessToken = await getAccessTokenFromRequest(request);

    if (!accessToken) {
      return NextResponse.json(
          { success: false, error: { message: "로그인이 필요합니다." } },
          { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/tickets/${id}`, {
      headers: createAuthHeaders(accessToken),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
          {
            success: false,
            error: { message: data.error?.message || data.message || "티켓 조회에 실패했습니다." },
          },
          { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: data.data || data });
  } catch (error) {
    console.error("Ticket detail error:", error);
    return NextResponse.json(
        { success: false, error: { message: "서버 오류가 발생했습니다." } },
        { status: 500 }
    );
  }
}