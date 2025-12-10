import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken, userType } = await request.json();

    if (!accessToken || !refreshToken || !userType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const maxAge = 60 * 60 * 24 * 7; // 7일

    // Access Token 저장 (HttpOnly)
    cookieStore.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    // Refresh Token 저장 (HttpOnly)
    cookieStore.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    // User Type 저장 (클라이언트 접근 가능)
    cookieStore.set("user_type", userType, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session save error:", error);
    return NextResponse.json(
      { error: "Failed to save session" },
      { status: 500 }
    );
  }
}
