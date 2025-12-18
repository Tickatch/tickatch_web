import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";
import type { AdminResponse, ChangeAdminRoleRequest } from "@/types/user";
import type { ApiResponse } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * PUT /api/user/admins/[id]/role - 관리자 역할 변경 (ADMIN만 가능)
 * @param request.body - ChangeAdminRoleRequest
 * @returns ApiResponse<AdminResponse>
 */
export async function PUT(
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

    const body: ChangeAdminRoleRequest = await request.json();

    const response = await fetch(`${API_URL}/user/admins/${id}/role`, {
      method: "PUT",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify(body),
    });

    const data: ApiResponse<AdminResponse> = await response.json();

    if (!response.ok) {
      return NextResponse.json<ApiResponse<null>>(
          { success: false, error: data.error || { code: "UPDATE_ERROR", message: "역할 변경에 실패했습니다.", status: response.status } },
          { status: response.status }
      );
    }

    return NextResponse.json<ApiResponse<AdminResponse>>(data);
  } catch (error) {
    console.error("Admin role change error:", error);
    return NextResponse.json<ApiResponse<null>>(
        { success: false, error: { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다.", status: 500 } },
        { status: 500 }
    );
  }
}