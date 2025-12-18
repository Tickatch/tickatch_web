import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/reservations - 예매 생성
 * 백엔드: POST /api/v1/reservations
 * Request: CreateReservationRequest
 * Response: ApiResponse<ReservationResponse>
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

    const response = await fetch(`${API_URL}/reservations`, {
      method: "POST",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
          {
            success: false,
            error: { message: data.error?.message || data.message || "예매에 실패했습니다." }
          },
          { status: response.status }
      );
    }

    // 백엔드 ApiResponse 형식: { success: true, data: ReservationResponse }
    return NextResponse.json(
        { success: true, data: data.data || data },
        { status: 201 }
    );
  } catch (error) {
    console.error("Reservation create error:", error);
    return NextResponse.json(
        { success: false, error: { message: "서버 오류가 발생했습니다." } },
        { status: 500 }
    );
  }
}

/**
 * GET /api/reservations - 내 예매 목록 조회
 * 백엔드: GET /api/v1/reservations/me
 * Response: ApiResponse<ReservationDetailResponse[]>
 * 인증 필수
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessTokenFromRequest(request);

    if (!accessToken) {
      return NextResponse.json(
          { success: false, error: { message: "로그인이 필요합니다." } },
          { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/reservations/me`, {
      method: "GET",
      headers: createAuthHeaders(accessToken),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
          {
            success: false,
            error: { message: data.error?.message || data.message || "예매 목록 조회에 실패했습니다." }
          },
          { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: data.data || data });
  } catch (error) {
    console.error("Reservation list error:", error);
    return NextResponse.json(
        { success: false, error: { message: "서버 오류가 발생했습니다." } },
        { status: 500 }
    );
  }
}