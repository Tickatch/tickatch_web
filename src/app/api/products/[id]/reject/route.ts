import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/products/[id]/reject - 상품 반려 (PENDING → REJECTED)
 * 인증 필수 (관리자)
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

    const body = await request.json();

    if (!body.reason) {
      return NextResponse.json(
          { error: "반려 사유는 필수입니다." },
          { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/products/${id}/reject`, {
      method: "POST",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
          { error: data.message || "상품 반려에 실패했습니다." },
          { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: "상품이 반려되었습니다." });
  } catch (error) {
    console.error("Product reject error:", error);
    return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
    );
  }
}