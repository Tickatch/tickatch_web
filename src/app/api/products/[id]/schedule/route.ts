import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/products/[id]/schedule - 예매 예정 (APPROVED → SCHEDULED)
 * 인증 필수
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accessToken = await getAccessTokenFromRequest(request);

    if (!accessToken) {
      return NextResponse.json(
          { error: "로그인이 필요합니다." },
          { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/products/${id}/schedule`, {
      method: "POST",
      headers: createAuthHeaders(accessToken),
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
          { error: data.message || "예매 예정 상태 변경에 실패했습니다." },
          { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: "예매 예정 상태로 변경되었습니다." });
  } catch (error) {
    console.error("Product schedule error:", error);
    return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
    );
  }
}