"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useQueue } from "@/hooks/useQueue";
import { cn } from "@/lib/utils";

export default function QueuePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isReady, isLoading, status, error, reset } = useQueue(isAuthenticated);

  // 비로그인 시 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/queue");
    }
  }, [authLoading, isAuthenticated, router]);

  // 입장하기 버튼 클릭
  const handleEnter = () => {
    // 대기열 완료 후 이동할 페이지 (예: 메인 또는 예매 페이지)
    reset(); // 토큰 초기화
    router.push("/");
  };

  // 로딩 중 (인증 확인 중)
  if (authLoading) {
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-400">로딩 중...</p>
          </div>
        </div>
    );
  }

  // 비로그인 상태
  if (!isAuthenticated) {
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400">로그인 페이지로 이동 중...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col">
        {/* 헤더 - 간소화 */}
        <header className="p-4">
          <Link href="/" className="text-white/70 hover:text-white transition-colors text-sm">
            ← 홈으로
          </Link>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            {/* 로고/타이틀 */}
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-white mb-2">TICKATCH</h1>
              <p className="text-gray-400">대기열 시스템</p>
            </div>

            {/* 대기열 카드 */}
            <div
                className={cn(
                    "bg-gray-900/80 backdrop-blur-sm",
                    "border border-gray-800 rounded-2xl",
                    "p-8 shadow-2xl"
                )}
            >
              {/* 에러 상태 */}
              {error && (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                      <svg
                          className="w-8 h-8 text-red-500"
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
                    <h2 className="text-xl font-semibold text-white mb-2">오류 발생</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className={cn(
                            "px-6 py-3 rounded-lg",
                            "bg-gray-800 hover:bg-gray-700",
                            "text-white font-medium",
                            "transition-colors"
                        )}
                    >
                      다시 시도
                    </button>
                  </div>
              )}

              {/* 로딩 상태 */}
              {isLoading && !error && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="mt-6 text-gray-400">대기열에 등록 중...</p>
                  </div>
              )}

              {/* 입장 가능 상태 */}
              {!isLoading && !error && isReady && (
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
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
                    <h2 className="text-2xl font-bold text-white mb-2">입장 가능!</h2>
                    <p className="text-gray-400 mb-8">이제 입장하실 수 있습니다.</p>
                    <button
                        onClick={handleEnter}
                        className={cn(
                            "w-full py-4 rounded-xl",
                            "bg-gradient-to-r from-orange-500 to-rose-500",
                            "hover:from-orange-600 hover:to-rose-600",
                            "text-white font-semibold text-lg",
                            "shadow-lg shadow-orange-500/25",
                            "transform hover:scale-[1.02] active:scale-[0.98]",
                            "transition-all duration-200"
                        )}
                    >
                      입장하기
                    </button>
                  </div>
              )}

              {/* 대기 중 상태 */}
              {!isLoading && !error && !isReady && status && (
                  <div className="text-center">
                    {/* 대기 애니메이션 */}
                    <div className="relative w-24 h-24 mx-auto mb-8">
                      <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full" />
                      <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-orange-500">
                      {status.userQueuePosition}
                    </span>
                      </div>
                    </div>

                    <h2 className="text-xl font-semibold text-white mb-6">대기 중입니다</h2>

                    {/* 대기 정보 그리드 */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {/* 내 순번 */}
                      <div className="bg-gray-800/50 rounded-xl p-4">
                        <p className="text-gray-400 text-xs mb-1">내 순번</p>
                        <p className="text-2xl font-bold text-white">
                          {status.userQueuePosition.toLocaleString()}
                        </p>
                      </div>

                      {/* 앞에 남은 인원 */}
                      <div className="bg-gray-800/50 rounded-xl p-4">
                        <p className="text-gray-400 text-xs mb-1">앞에 대기</p>
                        <p className="text-2xl font-bold text-orange-500">
                          {(status.userQueuePosition - 1).toLocaleString()}
                        </p>
                      </div>

                      {/* 총 대기 인원 */}
                      <div className="bg-gray-800/50 rounded-xl p-4">
                        <p className="text-gray-400 text-xs mb-1">총 대기</p>
                        <p className="text-2xl font-bold text-white">
                          {status.totalQueueSize.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* 안내 문구 */}
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-6">
                      <p className="text-orange-400 text-sm">
                        잠시만 기다려 주세요. 순서가 되면 자동으로 입장됩니다.
                      </p>
                    </div>

                    {/* 진행 바 (애니메이션) */}
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div
                          className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full animate-pulse"
                          style={{
                            width: `${Math.max(
                                5,
                                ((status.totalQueueSize - status.userQueuePosition + 1) /
                                    status.totalQueueSize) *
                                100
                            )}%`,
                          }}
                      />
                    </div>

                    {/* 비활성화된 입장 버튼 */}
                    <button
                        disabled
                        className={cn(
                            "w-full py-4 mt-6 rounded-xl",
                            "bg-gray-800 text-gray-500",
                            "font-semibold text-lg",
                            "cursor-not-allowed"
                        )}
                    >
                      대기 중...
                    </button>
                  </div>
              )}
            </div>

            {/* 하단 안내 */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                페이지를 벗어나면 대기 순서가 취소될 수 있습니다.
              </p>
            </div>
          </div>
        </main>

        {/* 푸터 */}
        <footer className="p-4 text-center">
          <p className="text-gray-600 text-xs">© 2025 Tickatch</p>
        </footer>
      </div>
  );
}