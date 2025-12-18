import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";
import type { AdminResponse } from "@/types/user";
import type { ApiResponse } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/user/admins/[id]/activate - 관리자 활성화 (정지 해제)
 * @returns ApiResponse<AdminResponse>
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accessToken = await getAccessTokenFromRequest(request);

    if (!accessToken) {
      return NextResponse.json<ApiResponse<null>>(
          { success: false, error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다.", status: 401 } },
          { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/user/admins/${id}/activate`, {
      method: "POST",
      headers: createAuthHeaders(accessToken),
    });

    const data: ApiResponse<AdminResponse> = await response.json();

    if (!response.ok) {
      return NextResponse.json<ApiResponse<null>>(
          { success: false, error: data.error || { code: "ACTIVATE_ERROR", message: "관리자 활성화에 실패했습니다.", status: response.status } },
          { status: response.status }
      );
    }

    return NextResponse.json<ApiResponse<AdminResponse>>(data);
  } catch (error) {
    console.error("Admin activate error:", error);
    return NextResponse.json<ApiResponse<null>>(
        { success: false, error: { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다.", status: 500 } },
        { status: 500 }
    );
  }
}