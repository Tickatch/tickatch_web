import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";
import { ApiResponse } from "@/types/api";
import {
  PaymentRequest,
  PaymentResponse,
  PaymentConfirmRequest,
  PaymentConfirmResponse,
} from "@/types/payment";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/payments
 * 결제 요청 또는 결제 확정
 *
 * - paymentKey가 없으면: 결제 요청 → 결제창 URL 반환
 * - paymentKey가 있으면: 결제 확정 → 예매 완료 처리
 * 인증 필수
 */
export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessTokenFromRequest(request);

    if (!accessToken) {
      return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "로그인이 필요합니다.",
              status: 401,
            },
          },
          { status: 401 }
      );
    }

    const body = await request.json();

    // paymentKey가 있으면 결제 확정 요청
    if (body.paymentKey) {
      return handlePaymentConfirm(body as PaymentConfirmRequest, accessToken);
    }

    // paymentKey가 없으면 결제 요청
    return handlePaymentRequest(body as PaymentRequest, accessToken);
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: "PAYMENT_ERROR",
            message: "결제 처리 중 오류가 발생했습니다.",
            status: 500,
          },
        },
        { status: 500 }
    );
  }
}

/**
 * 결제 요청 처리
 * 백엔드에서 결제창 URL을 반환받음
 */
async function handlePaymentRequest(
    body: PaymentRequest,
    accessToken: string
): Promise<NextResponse<ApiResponse<PaymentResponse>>> {
  try {
    const response = await fetch(`${API_URL}/payments`, {
      method: "POST",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json<ApiResponse<PaymentResponse>>(
          {
            success: false,
            error: {
              code: data.error?.code || "PAYMENT_REQUEST_FAILED",
              message: data.error?.message || "결제 요청에 실패했습니다.",
              status: response.status,
            },
          },
          { status: response.status }
      );
    }

    // 백엔드에서 ApiResponse로 래핑해서 오는 경우
    if (data.success !== undefined) {
      return NextResponse.json<ApiResponse<PaymentResponse>>(data);
    }

    // 직접 데이터가 오는 경우
    return NextResponse.json<ApiResponse<PaymentResponse>>({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Payment request error:", error);
    return NextResponse.json<ApiResponse<PaymentResponse>>(
        {
          success: false,
          error: {
            code: "PAYMENT_REQUEST_ERROR",
            message: "결제 요청 중 오류가 발생했습니다.",
            status: 500,
          },
        },
        { status: 500 }
    );
  }
}

/**
 * 결제 확정 처리
 * 토스에서 받은 paymentKey로 결제 완료 처리
 */
async function handlePaymentConfirm(
    body: PaymentConfirmRequest,
    accessToken: string
): Promise<NextResponse<ApiResponse<PaymentConfirmResponse>>> {
  try {
    const response = await fetch(`${API_URL}/payments/confirm`, {
      method: "POST",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json<ApiResponse<PaymentConfirmResponse>>(
          {
            success: false,
            error: {
              code: data.error?.code || "PAYMENT_CONFIRM_FAILED",
              message: data.error?.message || "결제 확정에 실패했습니다.",
              status: response.status,
            },
          },
          { status: response.status }
      );
    }

    // 백엔드에서 ApiResponse로 래핑해서 오는 경우
    if (data.success !== undefined) {
      return NextResponse.json<ApiResponse<PaymentConfirmResponse>>(data);
    }

    // 직접 데이터가 오는 경우
    return NextResponse.json<ApiResponse<PaymentConfirmResponse>>({
      success: true,
      data: data,
      message: "결제가 완료되었습니다.",
    });
  } catch (error) {
    console.error("Payment confirm error:", error);
    return NextResponse.json<ApiResponse<PaymentConfirmResponse>>(
        {
          success: false,
          error: {
            code: "PAYMENT_CONFIRM_ERROR",
            message: "결제 확정 중 오류가 발생했습니다.",
            status: 500,
          },
        },
        { status: 500 }
    );
  }
}