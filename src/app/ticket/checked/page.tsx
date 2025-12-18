"use client";

import { useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

type CheckedStatus = "processing" | "success" | "fail" | "invalid";

interface CheckedResult {
  status: CheckedStatus;
  title: string;
  message: string;
}

function TicketCheckedContent() {
  const searchParams = useSearchParams();
  const ticketId = searchParams.get("ticketId");

  // 결과 상태 계산
  const result = useMemo<CheckedResult>(() => {
    if (!ticketId) {
      return {
        status: "invalid",
        title: "잘못된 접근",
        message: "티켓 ID가 제공되지 않았습니다.",
      };
    }
    // 초기 상태는 processing
    return {
      status: "processing",
      title: "티켓 확인 중",
      message: "티켓을 확인하고 있습니다...",
    };
  }, [ticketId]);

  // 티켓 사용 API 호출
  useEffect(() => {
    if (!ticketId) return;

    const useTicket = async () => {
      try {
        const response = await fetch(`/api/tickets/${ticketId}/use`, {
          method: "POST",
          credentials: "include",
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // 성공 시 상태 업데이트를 위해 URL 변경
          const url = new URL(window.location.href);
          url.searchParams.set("result", "success");
          window.history.replaceState({}, "", url.toString());
          window.location.reload();
        } else {
          // 실패 시
          const url = new URL(window.location.href);
          url.searchParams.set("result", "fail");
          url.searchParams.set(
              "error",
              data.error?.message || "티켓 사용에 실패했습니다."
          );
          window.history.replaceState({}, "", url.toString());
          window.location.reload();
        }
      } catch (error) {
        console.error("Ticket use error:", error);
        const url = new URL(window.location.href);
        url.searchParams.set("result", "fail");
        url.searchParams.set("error", "서버 오류가 발생했습니다.");
        window.history.replaceState({}, "", url.toString());
        window.location.reload();
      }
    };

    // result 파라미터가 없을 때만 API 호출
    const resultParam = searchParams.get("result");
    if (!resultParam) {
      useTicket();
    }
  }, [ticketId, searchParams]);

  // URL에서 결과 확인
  const resultParam = searchParams.get("result");
  const errorParam = searchParams.get("error");

  const displayResult = useMemo<CheckedResult>(() => {
    if (!ticketId) {
      return {
        status: "invalid",
        title: "잘못된 접근",
        message: "티켓 ID가 제공되지 않았습니다.",
      };
    }

    if (resultParam === "success") {
      return {
        status: "success",
        title: "입장 완료",
        message: "티켓이 성공적으로 사용되었습니다. 즐거운 공연 되세요!",
      };
    }

    if (resultParam === "fail") {
      return {
        status: "fail",
        title: "입장 실패",
        message: errorParam || "티켓 사용에 실패했습니다.",
      };
    }

    return result;
  }, [ticketId, resultParam, errorParam, result]);

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center">
            {/* 상태 아이콘 */}
            {displayResult.status === "processing" && (
                <div className="w-20 h-20 mx-auto mb-6">
                  <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {displayResult.status === "success" && (
                <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg
                      className="w-10 h-10 text-green-500"
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
            )}

            {displayResult.status === "fail" && (
                <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg
                      className="w-10 h-10 text-red-500"
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
            )}

            {displayResult.status === "invalid" && (
                <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <svg
                      className="w-10 h-10 text-yellow-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
            )}

            {/* 제목 */}
            <h1
                className={cn(
                    "text-2xl font-bold mb-3",
                    displayResult.status === "success" &&
                    "text-green-600 dark:text-green-400",
                    displayResult.status === "fail" &&
                    "text-red-600 dark:text-red-400",
                    displayResult.status === "invalid" &&
                    "text-yellow-600 dark:text-yellow-400",
                    displayResult.status === "processing" &&
                    "text-gray-900 dark:text-white"
                )}
            >
              {displayResult.title}
            </h1>

            {/* 메시지 */}
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {displayResult.message}
            </p>

            {/* 티켓 ID 표시 */}
            {ticketId && displayResult.status !== "invalid" && (
                <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    티켓 ID
                  </p>
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                    {ticketId}
                  </p>
                </div>
            )}

            {/* 버튼 */}
            <div className="space-y-3">
              {displayResult.status === "success" && (
                  <Link
                      href="/"
                      className={cn(
                          "block w-full py-3 rounded-xl",
                          "bg-gradient-to-r from-orange-500 to-rose-500",
                          "hover:from-orange-600 hover:to-rose-600",
                          "text-white font-medium",
                          "transition-all"
                      )}
                  >
                    홈으로 이동
                  </Link>
              )}

              {displayResult.status === "fail" && (
                  <>
                    <button
                        onClick={() => {
                          // result, error 파라미터 제거 후 재시도
                          const url = new URL(window.location.href);
                          url.searchParams.delete("result");
                          url.searchParams.delete("error");
                          window.location.href = url.toString();
                        }}
                        className={cn(
                            "w-full py-3 rounded-xl",
                            "bg-gradient-to-r from-orange-500 to-rose-500",
                            "hover:from-orange-600 hover:to-rose-600",
                            "text-white font-medium",
                            "transition-all"
                        )}
                    >
                      다시 시도
                    </button>
                    <Link
                        href="/"
                        className={cn(
                            "block w-full py-3 rounded-xl",
                            "border border-gray-300 dark:border-gray-700",
                            "text-gray-700 dark:text-gray-300",
                            "hover:bg-gray-50 dark:hover:bg-gray-800",
                            "font-medium transition-colors"
                        )}
                    >
                      홈으로 이동
                    </Link>
                  </>
              )}

              {displayResult.status === "invalid" && (
                  <Link
                      href="/"
                      className={cn(
                          "block w-full py-3 rounded-xl",
                          "bg-gradient-to-r from-orange-500 to-rose-500",
                          "hover:from-orange-600 hover:to-rose-600",
                          "text-white font-medium",
                          "transition-all"
                      )}
                  >
                    홈으로 이동
                  </Link>
              )}
            </div>
          </div>

          {/* 하단 안내 */}
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            문제가 있으시면 현장 스태프에게 문의해 주세요.
          </p>
        </div>
      </div>
  );
}

export default function TicketCheckedPage() {
  return (
      <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }
      >
        <TicketCheckedContent />
      </Suspense>
  );
}