"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
      "loading"
  );
  const [message, setMessage] = useState("인증 처리 중...");

  useEffect(() => {
    const processCallback = () => {
      try {
        const success = searchParams.get("success");
        const error = searchParams.get("error");
        const dataParam = searchParams.get("data");

        // 에러 처리
        if (error) {
          const errorMessage = decodeURIComponent(error);
          setStatus("error");
          setMessage(errorMessage);

          if (window.opener) {
            window.opener.postMessage(
                {
                  type: "OAUTH_ERROR",
                  error: errorMessage,
                },
                window.location.origin
            );
          }
          return;
        }

        // 성공 처리
        if (success === "true" && dataParam) {
          const jsonData = decodeURIComponent(dataParam);
          const apiResponse = JSON.parse(jsonData);
          // 백엔드가 ApiResponse<LoginResponse>로 래핑해서 보냄
          // { success: true, data: { authId, accessToken, ... }, timestamp, traceId }
          const loginResponse = apiResponse.data;

          if (!loginResponse) {
            throw new Error("No login data in response");
          }

          setStatus("success");
          setMessage("로그인 성공! 창이 곧 닫힙니다.");

          if (window.opener) {
            window.opener.postMessage(
                {
                  type: "OAUTH_SUCCESS",
                  data: loginResponse,
                },
                window.location.origin
            );
          }

          // 잠시 후 창 닫기
          setTimeout(() => {
            window.close();
          }, 1500);
          return;
        }

        // 파라미터 없음
        setStatus("error");
        setMessage("잘못된 접근입니다.");
      } catch (err) {
        console.error("Failed to parse login response:", err);
        const errorMessage = "인증 처리 중 오류가 발생했습니다.";
        setStatus("error");
        setMessage(errorMessage);

        if (window.opener) {
          window.opener.postMessage(
              {
                type: "OAUTH_ERROR",
                error: errorMessage,
              },
              window.location.origin
          );
        }
      }
    };

    processCallback();
  }, [searchParams]);

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 max-w-sm">
          {status === "loading" && (
              <>
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">{message}</p>
              </>
          )}

          {status === "success" && (
              <>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                      className="w-8 h-8 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-green-600 dark:text-green-400 font-medium text-lg">
                  {message}
                </p>
              </>
          )}

          {status === "error" && (
              <>
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                      className="w-8 h-8 text-red-600 dark:text-red-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <p className="text-red-600 dark:text-red-400 font-medium text-lg mb-4">
                  {message}
                </p>
                <button
                    onClick={() => window.close()}
                    className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  창 닫기
                </button>
              </>
          )}
        </div>
      </div>
  );
}

export default function OAuthCallbackPage() {
  return (
      <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          }
      >
        <OAuthCallbackContent />
      </Suspense>
  );
}