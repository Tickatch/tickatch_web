"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface PaymentFailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  errorMessage?: string;
}

export default function PaymentFailModal({
                                           isOpen,
                                           onClose,
                                           onRetry,
                                           errorMessage = "결제 처리 중 오류가 발생했습니다.",
                                         }: PaymentFailModalProps) {
  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* 오버레이 */}
        <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        />

        {/* 모달 */}
        <div
            className={cn(
                "relative w-full max-w-md",
                "bg-white dark:bg-gray-900",
                "rounded-2xl shadow-2xl",
                "overflow-hidden",
                "animate-in zoom-in-95 duration-200"
            )}
        >
          {/* 닫기 버튼 */}
          <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
          >
            <svg
                className="w-4 h-4 text-gray-500"
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

          {/* 컨텐츠 */}
          <div className="p-8 text-center">
            {/* 아이콘 */}
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* 제목 */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              결제 실패
            </h2>

            {/* 메시지 */}
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {errorMessage}
              <br />
              <span className="text-sm">다시 시도해 주세요.</span>
            </p>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                  onClick={onClose}
                  className={cn(
                      "flex-1 py-3 rounded-xl",
                      "border border-gray-300 dark:border-gray-700",
                      "text-gray-700 dark:text-gray-300",
                      "font-medium",
                      "hover:bg-gray-50 dark:hover:bg-gray-800",
                      "transition-colors"
                  )}
              >
                닫기
              </button>
              <button
                  onClick={() => {
                    onClose();
                    onRetry();
                  }}
                  className={cn(
                      "flex-1 py-3 rounded-xl",
                      "bg-gradient-to-r from-orange-500 to-rose-500",
                      "hover:from-orange-600 hover:to-rose-600",
                      "text-white font-medium",
                      "transition-all"
                  )}
              >
                다시 결제하기
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}