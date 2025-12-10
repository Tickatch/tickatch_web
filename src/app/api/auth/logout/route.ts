import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;

    // 백엔드 로그아웃 API 호출 (선택적)
    if (accessToken && refreshToken) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        await fetch(`${apiUrl}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            refreshToken,
            allDevices: false,
          }),
        });
      } catch (error) {
        // 백엔드 로그아웃 실패해도 쿠키는 삭제
        console.error("Backend logout error:", error);
      }
    }

    // 쿠키 삭제
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
    cookieStore.delete("user_type");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
