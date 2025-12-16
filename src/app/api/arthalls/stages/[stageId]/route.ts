import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  createAuthHeaders,
} from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/arthalls/stages/[stageId] - 스테이지 상세 조회
 * 인증 선택
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ stageId: string }> }
) {
  try {
    const { stageId } = await params;
    const accessToken = await getAccessTokenFromRequest(request);

    const response = await fetch(`${API_URL}/arthalls/stages/${stageId}`, {
      headers: createAuthHeaders(accessToken),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
          { error: data.message || "스테이지 조회에 실패했습니다." },
          { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Stage detail error:", error);
    return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
    );
  }
}

/**
 * PUT /api/arthalls/stages/[stageId] - 스테이지 수정
 * 인증 필수
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ stageId: string }> }
) {
  try {
    const { stageId } = await params;
    const accessToken = await getAccessTokenFromRequest(request);

    if (!accessToken) {
      return NextResponse.json(
          { error: "로그인이 필요합니다." },
          { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${API_URL}/arthalls/stages/${stageId}`, {
      method: "PUT",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
          { error: data.message || "스테이지 수정에 실패했습니다." },
          { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Stage update error:", error);
    return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
    );
  }
}

/**
 * DELETE /api/arthalls/stages/[stageId] - 스테이지 삭제
 * 인증 필수
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ stageId: string }> }
) {
  try {
    const { stageId } = await params;
    const accessToken = await getAccessTokenFromRequest(request);

    if (!accessToken) {
      return NextResponse.json(
          { error: "로그인이 필요합니다." },
          { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/arthalls/stages/${stageId}`, {
      method: "DELETE",
      headers: createAuthHeaders(accessToken),
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
          { error: data.message || "스테이지 삭제에 실패했습니다." },
          { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: "스테이지가 삭제되었습니다." });
  } catch (error) {
    console.error("Stage delete error:", error);
    return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
    );
  }
}