// app/api/queue/stream/route.ts
import { NextRequest } from "next/server";
import { getAccessTokenFromRequest } from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/queue/stream - SSE 대기열 스트림
 * 백엔드 SSE를 프록시하여 클라이언트에 전달
 */
export async function GET(request: NextRequest) {
  const accessToken = await getAccessTokenFromRequest(request);

  if (!accessToken) {
    return new Response(
        JSON.stringify({ success: false, error: { message: "로그인이 필요합니다." } }),
        { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // 백엔드 SSE 엔드포인트에 연결
  const backendUrl = `${API_URL}/queue/stream`;

  try {
    const backendResponse = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "text/event-stream",
        "Cache-Control": "no-cache",
      },
      // @ts-expect-error - Node.js fetch의 duplex 옵션
      duplex: "half",
    });

    if (!backendResponse.ok) {
      return new Response(
          JSON.stringify({
            success: false,
            error: { message: "대기열 연결 실패" }
          }),
          { status: backendResponse.status, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!backendResponse.body) {
      return new Response(
          JSON.stringify({
            success: false,
            error: { message: "스트림을 받을 수 없습니다." }
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // SSE 스트림을 클라이언트에 전달
    return new Response(backendResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no", // nginx 버퍼링 비활성화
      },
    });
  } catch (error) {
    console.error("Queue stream error:", error);
    return new Response(
        JSON.stringify({
          success: false,
          error: { message: "대기열 스트림 연결 중 오류 발생" }
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}