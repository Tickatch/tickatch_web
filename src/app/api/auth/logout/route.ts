// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { TOKEN_NAMES, getUserTypeFromPath } from "@/lib/auth-utils";

/**
 * POST /api/auth/logout - 로그아웃
 * 유저 타입별 토큰 삭제
 */
export async function POST(request: NextRequest) {
  try {
    // 쿼리 파라미터 또는 body에서 userType 가져오기
    const { searchParams } = new URL(request.url);
    let userType = searchParams.get("userType") as "CUSTOMER" | "SELLER" | "ADMIN" | null;

    // userType이 없으면 Referer에서 추론
    if (!userType) {
      const referer = request.headers.get("referer") || "";
      const url = new URL(referer, request.url);
      userType = getUserTypeFromPath(url.pathname);
    }

    const tokenNames = TOKEN_NAMES[userType || "CUSTOMER"];

    const res = NextResponse.json({ success: true });

    // 해당 유저 타입의 토큰만 삭제
    res.cookies.delete(tokenNames.accessToken);
    res.cookies.delete(tokenNames.refreshToken);
    res.cookies.delete(`logged_in_${(userType || "customer").toLowerCase()}`);

    return res;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
        { success: false, error: "로그아웃 실패" },
        { status: 500 }
    );
  }
}