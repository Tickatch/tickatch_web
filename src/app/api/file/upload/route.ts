import { NextRequest, NextResponse } from "next/server";

// Streamix 파일 서버 URL (게이트웨이 별도)
const FILE_SERVER_URL = "https://www.pinjun.xyz/file/api/streamix/files";
const FILE_BASE_URL = "https://www.pinjun.xyz/file";

/**
 * Streamix 파일 업로드 응답 타입
 */
interface StreamixUploadResponse {
  id: string;
  originalName: string;
  type: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "OTHER";
  contentType: string;
  size: number;
  thumbnailGenerated: boolean;
  streamUrl: string;
  thumbnailUrl?: string;
}

/**
 * POST /api/file/upload - 파일 업로드
 * 외부 Streamix 파일 서버로 프록시
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
          { success: false, error: "파일이 없습니다." },
          { status: 400 }
      );
    }

    // 파일 크기 제한 (100MB)
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
          { success: false, error: "파일 크기는 100MB를 초과할 수 없습니다." },
          { status: 400 }
      );
    }

    // Streamix 서버로 파일 전송
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    const response = await fetch(FILE_SERVER_URL, {
      method: "POST",
      body: uploadFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Streamix upload error:", errorText);
      return NextResponse.json(
          { success: false, error: "파일 업로드에 실패했습니다." },
          { status: response.status }
      );
    }

    const data: StreamixUploadResponse = await response.json();

    // URL을 절대 경로로 변환
    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        originalName: data.originalName,
        type: data.type,
        contentType: data.contentType,
        size: data.size,
        thumbnailGenerated: data.thumbnailGenerated,
        // Streamix 경로를 절대 URL로 변환
        url: data.streamUrl ? `${FILE_BASE_URL}${data.streamUrl}` : null,
        streamUrl: data.streamUrl ? `${FILE_BASE_URL}${data.streamUrl}` : null,
        thumbnailUrl: data.thumbnailUrl ? `${FILE_BASE_URL}${data.thumbnailUrl}` : null,
      },
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
        { success: false, error: "파일 업로드 중 오류가 발생했습니다." },
        { status: 500 }
    );
  }
}