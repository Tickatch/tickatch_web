import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/tickets - 티켓 목록 조회
 * 백엔드: GET /api/v1/tickets
 * Query: page, size, sort
 * Response: PageResponse<TicketResponse>
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

    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    const url = queryString
        ? `${API_URL}/tickets?${queryString}`
        : `${API_URL}/tickets`;

    const response = await fetch(url, {
      headers: createAuthHeaders(accessToken),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
          {
            success: false,
            error: { message: data.error?.message || data.message || "티켓 목록 조회에 실패했습니다." },
          },
          { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: data.data || data });
  } catch (error) {
    console.error("Ticket list error:", error);
    return NextResponse.json(
        { success: false, error: { message: "서버 오류가 발생했습니다." } },
        { status: 500 }
    );
  }
}

/**
 * POST /api/tickets - 티켓 생성
 * 백엔드: POST /api/v1/tickets
 * Request: CreateTicketRequest
 * Response: ApiResponse<TicketResponse>
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

    const response = await fetch(`${API_URL}/tickets`, {
      method: "POST",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
          {
            success: false,
            error: { message: data.error?.message || data.message || "티켓 생성에 실패했습니다." },
          },
          { status: response.status }
      );
    }

    return NextResponse.json(
        { success: true, data: data.data || data, message: "티켓이 발행되었습니다." },
        { status: 201 }
    );
  } catch (error) {
    console.error("Ticket create error:", error);
    return NextResponse.json(
        { success: false, error: { message: "서버 오류가 발생했습니다." } },
        { status: 500 }
    );
  }
}