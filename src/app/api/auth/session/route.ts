import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, refreshToken, userType } = body;

    const response = NextResponse.json({ success: true });
    const isProduction = process.env.NODE_ENV === "production";

    // JWT에서 exp 추출해서 남은 시간 계산
    const accessTokenMaxAge = getTokenRemainingSeconds(accessToken) || 5 * 60; // 기본 5분
    const refreshTokenMaxAge = 7 * 24 * 60 * 60; // 7일

    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: accessTokenMaxAge, // JWT exp와 동기화
    });

    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: refreshTokenMaxAge,
    });

    if (userType) {
      response.cookies.set("user_type", userType, {
        httpOnly: false,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: refreshTokenMaxAge,
      });
    }

    return response;
  } catch (error) {
    console.error("Session save error:", error);
    return NextResponse.json(
      { error: "Failed to save session" },
      { status: 500 }
    );
  }
}

// JWT에서 남은 시간(초) 계산
function getTokenRemainingSeconds(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString());
    const exp = decoded.exp;

    if (!exp) return null;

    const now = Math.floor(Date.now() / 1000);
    const remaining = exp - now;

    return remaining > 0 ? remaining : 0;
  } catch {
    return null;
  }
}
