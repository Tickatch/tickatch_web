import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/payments/resp/fail - 결제 실패 콜백
 * 백엔드: GET /api/v1/payments/resp/fail
 * Query: code, message (optional), orderId
 * Response: ApiResponse<void>
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessTokenFromRequest(request);
    const { searchParams } = new URL(request.url);

    const code = searchParams.get("code") || "UNKNOWN";
    const message = searchParams.get("message") || "";
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
          { success: false, error: { message: "orderId가 누락되었습니다." } },
          { status: 400 }
      );
    }

    const headers = accessToken
        ? createAuthHeaders(accessToken)
        : { "Content-Type": "application/json" };

    const queryParams = new URLSearchParams({
      code,
      orderId,
      ...(message && { message }),
    });

    const response = await fetch(
        `${API_URL}/payments/resp/fail?${queryParams.toString()}`,
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
            error: { message: data.error?.message || data.message || "결제 실패 처리 중 오류가 발생했습니다." },
          },
          { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: data.data || data });
  } catch (error) {
    console.error("Payment fail callback error:", error);
    return NextResponse.json(
        { success: false, error: { message: "서버 오류가 발생했습니다." } },
        { status: 500 }
    );
  }
}