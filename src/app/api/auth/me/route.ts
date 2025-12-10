import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const userType = cookieStore.get("user_type")?.value;

    if (!accessToken) {
      return NextResponse.json({ user: null, userType: null }, { status: 200 });
    }

    // 백엔드 API로 사용자 정보 조회
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      // 토큰이 만료되었거나 유효하지 않은 경우
      return NextResponse.json({ user: null, userType: null }, { status: 200 });
    }

    const user = await response.json();

    return NextResponse.json({
      user,
      userType,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ user: null, userType: null }, { status: 200 });
  }
}
