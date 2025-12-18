import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";
import type {
  SellerResponse,
  CreateSellerRequest,
} from "@/types/user";
import type { ApiResponse, PageResponse } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/user/sellers - 판매자 목록 조회
 * @param request.searchParams - SellerSearchRequest & PageRequest
 * @returns ApiResponse<PageResponse<SellerResponse>>
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessTokenFromRequest(request);

    if (!accessToken) {
      return NextResponse.json<ApiResponse<null>>(
          { success: false, error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다.", status: 401 } },
          { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    const url = queryString
        ? `${API_URL}/user/sellers?${queryString}`
        : `${API_URL}/user/sellers`;

    const response = await fetch(url, {
      headers: createAuthHeaders(accessToken),
      cache: "no-store",
    });

    const data: ApiResponse<PageResponse<SellerResponse>> = await response.json();

    if (!response.ok) {
      return NextResponse.json<ApiResponse<null>>(
          { success: false, error: data.error || { code: "FETCH_ERROR", message: "판매자 목록 조회에 실패했습니다.", status: response.status } },
          { status: response.status }
      );
    }

    return NextResponse.json<ApiResponse<PageResponse<SellerResponse>>>(data);
  } catch (error) {
    console.error("Sellers list error:", error);
    return NextResponse.json<ApiResponse<null>>(
        { success: false, error: { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다.", status: 500 } },
        { status: 500 }
    );
  }
}

/**
 * POST /api/user/sellers - 판매자 생성 (PENDING 상태로 생성)
 * @param request.body - CreateSellerRequest
 * @returns ApiResponse<SellerResponse>
 */
export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessTokenFromRequest(request);

    if (!accessToken) {
      return NextResponse.json<ApiResponse<null>>(
          { success: false, error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다.", status: 401 } },
          { status: 401 }
      );
    }

    const body: CreateSellerRequest = await request.json();

    const response = await fetch(`${API_URL}/user/sellers`, {
      method: "POST",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify(body),
    });

    const data: ApiResponse<SellerResponse> = await response.json();

    if (!response.ok) {
      return NextResponse.json<ApiResponse<null>>(
          { success: false, error: data.error || { code: "CREATE_ERROR", message: "판매자 생성에 실패했습니다.", status: response.status } },
          { status: response.status }
      );
    }

    return NextResponse.json<ApiResponse<SellerResponse>>(data, { status: 201 });
  } catch (error) {
    console.error("Seller create error:", error);
    return NextResponse.json<ApiResponse<null>>(
        { success: false, error: { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다.", status: 500 } },
        { status: 500 }
    );
  }
}