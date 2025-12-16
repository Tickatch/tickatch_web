import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/arthalls/stages/[stageId]/stage-seats - 좌석 목록 조회
 * Query params: seatNumber
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ stageId: string }> }
) {
  try {
    const { stageId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    const url = queryString
        ? `${API_URL}/arthalls/stages/${stageId}/stage-seats?${queryString}`
        : `${API_URL}/arthalls/stages/${stageId}/stage-seats`;

    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
          { error: data.message || "좌석 목록 조회에 실패했습니다." },
          { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Stage seats list error:", error);
    return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
    );
  }
}

/**
 * POST /api/arthalls/stages/[stageId]/stage-seats - 좌석 등록 (여러개)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ stageId: string }> }
) {
  try {
    const { stageId } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
          { error: "로그인이 필요합니다." },
          { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${API_URL}/arthalls/stages/${stageId}/stage-seats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
          { error: data.message || "좌석 등록에 실패했습니다." },
          { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Stage seats register error:", error);
    return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
    );
  }
}