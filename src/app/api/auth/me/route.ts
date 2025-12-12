import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;
    const userType = cookieStore.get("user_type")?.value;

    // accessToken 없으면 refresh 시도
    if (!accessToken) {
      if (!refreshToken) {
        return NextResponse.json({ user: null, userType: null });
      }

      // refresh 시도
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!refreshRes.ok) {
        const response = NextResponse.json({ user: null, userType: null });
        response.cookies.delete("refresh_token");
        response.cookies.delete("user_type");
        return response;
      }

      const tokens = await refreshRes.json();

      // 새 토큰으로 사용자 정보 조회
      const userRes = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });

      if (!userRes.ok) {
        return NextResponse.json({ user: null, userType: null });
      }

      const user = await userRes.json();
      const response = NextResponse.json({ user, userType });

      // 새 토큰 쿠키 저장
      const maxAge = getTokenRemainingSeconds(tokens.accessToken) || 5 * 60;
      response.cookies.set("access_token", tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge,
      });
      response.cookies.set("refresh_token", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    // accessToken 있으면 바로 조회
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      return NextResponse.json({ user: null, userType: null });
    }

    const user = await response.json();
    return NextResponse.json({ user, userType });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ user: null, userType: null });
  }
}

function getTokenRemainingSeconds(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString());
    const remaining = decoded.exp - Math.floor(Date.now() / 1000);
    return remaining > 0 ? remaining : 0;
  } catch {
    return null;
  }
}
