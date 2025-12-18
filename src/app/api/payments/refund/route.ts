import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/payments/refund - 환불 요청
 * 백엔드: POST /api/v1/payments/refund
 * Request: RefundPaymentRequest { reason, reservationIds }
 * Response: ApiResponse<void>
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

    const body = await request.json();

    const response = await fetch(`${API_URL}/payments/refund`, {
      method: "POST",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
          {
            success: false,
            error: { message: data.error?.message || data.message || "환불 처리에 실패했습니다." },
          },
          { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: data.data || data });
  } catch (error) {
    console.error("Payment refund error:", error);
    return NextResponse.json(
        { success: false, error: { message: "서버 오류가 발생했습니다." } },
        { status: 500 }
    );
  }
}