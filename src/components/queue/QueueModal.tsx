// components/queue/QueueModal.tsx
"use client";

import { useEffect } from "react";
import { useQueue } from "@/hooks/useQueue";
import { cn } from "@/lib/utils";

interface QueueModalProps {
  /** 모달 열림 여부 */
  isOpen: boolean;
  /** 모달 닫기 */
  onClose: () => void;
  /** 로그인 여부 */
  isAuthenticated: boolean;
  /** 상품명 (표시용) */
  productName?: string;
  /** 입장 가능 시 콜백 */
  onReady: () => void;
}

export default function QueueModal({
                                     isOpen,
                                     onClose,
                                     isAuthenticated,
                                     productName,
                                     onReady,
                                   }: QueueModalProps) {
  const { isReady, isLoading, status, error, reset } = useQueue(
      isOpen && isAuthenticated
  );

  // 입장 가능 시 콜백 호출
  useEffect(() => {
    if (isReady && isOpen) {
      onReady();
    }
  }, [isReady, isOpen, onReady]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading && !status) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, isLoading, status]);

  // 모달 닫을 때 대기열 초기화
  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* 오버레이 */}
        <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={!isLoading && !status ? handleClose : undefined}
        />

        {/* 모달 */}
        <div
            className={cn(
                "relative w-full max-w-md",
                "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950",
                "border border-gray-800 rounded-2xl shadow-2xl",
                "overflow-hidden",
                "animate-in zoom-in-95 duration-200"
            )}
        >
          {/* 닫기 버튼 - 대기 중이 아닐 때만 표시 */}
          {!isLoading && !status && (
              <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors z-10"
              >
                <svg
                    className="w-4 h-4 text-gray-400"
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
              </button>
          )}

          {/* 컨텐츠 */}
          <div className="p-8">
            {/* 로고/타이틀 */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white mb-1">TICKATCH</h2>
              <p className="text-gray-400 text-sm">대기열 시스템</p>
              {productName && (
                  <p className="text-orange-400 text-sm mt-2 truncate">
                    {productName}
                  </p>
              )}
            </div>

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
                  <h3 className="text-lg font-semibold text-white mb-2">
                    오류 발생
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">{error}</p>
                  <button
                      onClick={handleClose}
                      className={cn(
                          "px-6 py-3 rounded-lg",
                          "bg-gray-800 hover:bg-gray-700",
                          "text-white font-medium",
                          "transition-colors"
                      )}
                  >
                    닫기
                  </button>
                </div>
            )}

            {/* 로딩 상태 */}
            {isLoading && !error && (
                <div className="text-center py-4">
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
                  <h3 className="text-2xl font-bold text-white mb-2">입장 가능!</h3>
                  <p className="text-gray-400 mb-6">
                    이제 예매 페이지로 이동합니다.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-orange-400">
                    <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">이동 중...</span>
                  </div>
                </div>
            )}

            {/* 대기 중 상태 */}
            {!isLoading && !error && !isReady && status && (
                <div className="text-center">
                  {/* 대기 애니메이션 */}
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-orange-500">
                    {status.userQueuePosition}
                  </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-4">
                    대기 중입니다
                  </h3>

                  {/* 대기 정보 그리드 */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {/* 내 순번 */}
                    <div className="bg-gray-800/50 rounded-xl p-3">
                      <p className="text-gray-400 text-xs mb-1">내 순번</p>
                      <p className="text-xl font-bold text-white">
                        {status.userQueuePosition.toLocaleString()}
                      </p>
                    </div>

                    {/* 앞에 남은 인원 */}
                    <div className="bg-gray-800/50 rounded-xl p-3">
                      <p className="text-gray-400 text-xs mb-1">앞에 대기</p>
                      <p className="text-xl font-bold text-orange-500">
                        {(status.userQueuePosition - 1).toLocaleString()}
                      </p>
                    </div>

                    {/* 총 대기 인원 */}
                    <div className="bg-gray-800/50 rounded-xl p-3">
                      <p className="text-gray-400 text-xs mb-1">총 대기</p>
                      <p className="text-xl font-bold text-white">
                        {status.totalQueueSize.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* 안내 문구 */}
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4">
                    <p className="text-orange-400 text-sm">
                      잠시만 기다려 주세요. 순서가 되면 자동으로 이동합니다.
                    </p>
                  </div>

                  {/* 진행 바 */}
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden mb-4">
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

                  {/* 경고 문구 */}
                  <p className="text-gray-500 text-xs">
                    이 창을 닫으면 대기 순서가 취소됩니다.
                  </p>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}