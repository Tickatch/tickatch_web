import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";
import type { AdminResponse } from "@/types/user";
import type { ApiResponse } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/user/admins/[id] - 관리자 단건 조회
 * @returns ApiResponse<AdminResponse>
 */
export async function GET(
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

    const response = await fetch(`${API_URL}/user/admins/${id}`, {
      headers: createAuthHeaders(accessToken),
      cache: "no-store",
    });

    const data: ApiResponse<AdminResponse> = await response.json();

    if (!response.ok) {
      return NextResponse.json<ApiResponse<null>>(
          { success: false, error: data.error || { code: "FETCH_ERROR", message: "관리자 조회에 실패했습니다.", status: response.status } },
          { status: response.status }
      );
    }

    return NextResponse.json<ApiResponse<AdminResponse>>(data);
  } catch (error) {
    console.error("Admin get error:", error);
    return NextResponse.json<ApiResponse<null>>(
        { success: false, error: { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다.", status: 500 } },
        { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/admins/[id] - 관리자 탈퇴
 * @returns ApiResponse<null>
 */
export async function DELETE(
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

    const response = await fetch(`${API_URL}/user/admins/${id}`, {
      method: "DELETE",
      headers: createAuthHeaders(accessToken),
    });

    if (!response.ok) {
      const data: ApiResponse<null> = await response.json();
      return NextResponse.json<ApiResponse<null>>(
          { success: false, error: data.error || { code: "DELETE_ERROR", message: "관리자 탈퇴에 실패했습니다.", status: response.status } },
          { status: response.status }
      );
    }

    return NextResponse.json<ApiResponse<null>>(
        { success: true, message: "관리자가 탈퇴되었습니다." }
    );
  } catch (error) {
    console.error("Admin delete error:", error);
    return NextResponse.json<ApiResponse<null>>(
        { success: false, error: { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다.", status: 500 } },
        { status: 500 }
    );
  }
}