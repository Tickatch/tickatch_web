// app/api/products/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  console.log("API_URL:", API_URL);
  console.log("accessToken:", accessToken ? "있음" : "없음");

  const res = await fetch(`${API_URL}/products`, {
    headers: {
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });

  console.log("응답 상태:", res.status);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("에러 응답:", errorText);
    return NextResponse.json({ error: errorText }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
