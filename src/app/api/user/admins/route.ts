import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";
import type {
  AdminResponse,
  AdminSearchRequest,
  CreateAdminRequest,
} from "@/types/user";
import type { ApiResponse, PageResponse } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/user/admins - 관리자 목록 조회
 * @param request.searchParams - AdminSearchRequest & PageRequest
 * @returns ApiResponse<PageResponse<AdminResponse>>
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
        ? `${API_URL}/user/admins?${queryString}`
        : `${API_URL}/user/admins`;

    const response = await fetch(url, {
      headers: createAuthHeaders(accessToken),
      cache: "no-store",
    });

    const data: ApiResponse<PageResponse<AdminResponse>> = await response.json();

    if (!response.ok) {
      return NextResponse.json<ApiResponse<null>>(
          { success: false, error: data.error || { code: "FETCH_ERROR", message: "관리자 목록 조회에 실패했습니다.", status: response.status } },
          { status: response.status }
      );
    }

    return NextResponse.json<ApiResponse<PageResponse<AdminResponse>>>(data);
  } catch (error) {
    console.error("Admins list error:", error);
    return NextResponse.json<ApiResponse<null>>(
        { success: false, error: { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다.", status: 500 } },
        { status: 500 }
    );
  }
}

/**
 * POST /api/user/admins - 관리자 생성
 * @param request.body - CreateAdminRequest
 * @returns ApiResponse<AdminResponse>
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

    const body: CreateAdminRequest = await request.json();

    const response = await fetch(`${API_URL}/user/admins`, {
      method: "POST",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify(body),
    });

    const data: ApiResponse<AdminResponse> = await response.json();

    if (!response.ok) {
      return NextResponse.json<ApiResponse<null>>(
          { success: false, error: data.error || { code: "CREATE_ERROR", message: "관리자 생성에 실패했습니다.", status: response.status } },
          { status: response.status }
      );
    }

    return NextResponse.json<ApiResponse<AdminResponse>>(data, { status: 201 });
  } catch (error) {
    console.error("Admin create error:", error);
    return NextResponse.json<ApiResponse<null>>(
        { success: false, error: { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다.", status: 500 } },
        { status: 500 }
    );
  }
}