import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/payments/resp/success - 결제 성공 콜백
 * 백엔드: GET /api/v1/payments/resp/success
 * Query: paymentKey, orderId, amount
 * Response: ApiResponse<void>
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessTokenFromRequest(request);
    const { searchParams } = new URL(request.url);

    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
          { success: false, error: { message: "필수 파라미터가 누락되었습니다." } },
          { status: 400 }
      );
    }

    const headers = accessToken
        ? createAuthHeaders(accessToken)
        : { "Content-Type": "application/json" };

    const response = await fetch(
        `${API_URL}/payments/resp/success?paymentKey=${paymentKey}&orderId=${orderId}&amount=${amount}`,
        {
          method: "GET",
          headers,
        }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
          {
            success: false,
            error: { message: data.error?.message || data.message || "결제 확정에 실패했습니다." },
          },
          { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: data.data || data });
  } catch (error) {
    console.error("Payment success callback error:", error);
    return NextResponse.json(
        { success: false, error: { message: "서버 오류가 발생했습니다." } },
        { status: 500 }
    );
  }
}