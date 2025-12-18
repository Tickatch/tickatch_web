import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";
import type { SellerResponse, UpdateSettlementInfoRequest } from "@/types/user";
import type { ApiResponse } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * PUT /api/user/sellers/[id]/settlement - 정산 정보 수정 (승인된 판매자만)
 * @param request.body - UpdateSettlementInfoRequest
 * @returns ApiResponse<SellerResponse>
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

    const body: UpdateSettlementInfoRequest = await request.json();

    const response = await fetch(`${API_URL}/user/sellers/${id}/settlement`, {
      method: "PUT",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify(body),
    });

    const data: ApiResponse<SellerResponse> = await response.json();

    if (!response.ok) {
      return NextResponse.json<ApiResponse<null>>(
          { success: false, error: data.error || { code: "UPDATE_ERROR", message: "정산 정보 수정에 실패했습니다.", status: response.status } },
          { status: response.status }
      );
    }

    return NextResponse.json<ApiResponse<SellerResponse>>(data);
  } catch (error) {
    console.error("Seller settlement update error:", error);
    return NextResponse.json<ApiResponse<null>>(
        { success: false, error: { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다.", status: 500 } },
        { status: 500 }
    );
  }
}