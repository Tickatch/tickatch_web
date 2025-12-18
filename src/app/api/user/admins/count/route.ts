import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";
import type { ApiResponse } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/user/admins/count - 역할별 활성 관리자 수 조회
 * @param request.searchParams.role - AdminRole (필수)
 * @returns ApiResponse<number>
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

    const role = request.nextUrl.searchParams.get("role");

    if (!role) {
      return NextResponse.json<ApiResponse<null>>(
          { success: false, error: { code: "BAD_REQUEST", message: "role 파라미터가 필요합니다.", status: 400 } },
          { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/user/admins/count?role=${role}`, {
      headers: createAuthHeaders(accessToken),
      cache: "no-store",
    });

    const data: ApiResponse<number> = await response.json();

    if (!response.ok) {
      return NextResponse.json<ApiResponse<null>>(
          { success: false, error: data.error || { code: "FETCH_ERROR", message: "관리자 수 조회에 실패했습니다.", status: response.status } },
          { status: response.status }
      );
    }

    return NextResponse.json<ApiResponse<number>>(data);
  } catch (error) {
    console.error("Admin count error:", error);
    return NextResponse.json<ApiResponse<null>>(
        { success: false, error: { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다.", status: 500 } },
        { status: 500 }
    );
  }
}