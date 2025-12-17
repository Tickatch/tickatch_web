"use client";

import { useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface EventItem {
  id: number;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  status: "UPCOMING" | "ONGOING" | "ENDED";
  benefits?: string[];
  conditions?: string[];
}

export const EVENT_STATUS_LABELS: Record<string, string> = {
  UPCOMING: "예정",
  ONGOING: "진행중",
  ENDED: "종료",
};

export const EVENT_STATUS_COLORS: Record<string, string> = {
  UPCOMING: "bg-blue-500 text-white",
  ONGOING: "bg-green-500 text-white",
  ENDED: "bg-gray-500 text-white",
};

interface EventDetailModalProps {
  event: EventItem;
  onClose: () => void;
  onParticipate?: (event: EventItem) => void;
}

export default function EventDetailModal({
                                           event,
                                           onClose,
                                           onParticipate,
                                         }: EventDetailModalProps) {
  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleParticipate = () => {
    if (onParticipate) {
      onParticipate(event);
    }
    onClose();
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* 오버레이 */}
        <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        />

        {/* 모달 */}
        <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          {/* 닫기 버튼 */}
          <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
          >
            <svg
                className="w-5 h-5"
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

          {/* 스크롤 영역 */}
          <div className="overflow-y-auto max-h-[90vh]">
            {/* 이미지 */}
            <div className="relative aspect-[2/1] w-full">
              <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
              <span
                  className={cn(
                      "inline-block px-3 py-1 rounded-full text-sm font-medium mb-2",
                      EVENT_STATUS_COLORS[event.status]
                  )}
              >
                {EVENT_STATUS_LABELS[event.status]}
              </span>
                <h2 className="text-2xl font-bold text-white">{event.title}</h2>
              </div>
            </div>

            {/* 컨텐츠 */}
            <div className="p-6">
              {/* 기간 */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                {formatDate(event.startDate)} ~ {formatDate(event.endDate)}
              </span>
              </div>

              {/* 설명 */}
              <div className="mb-6">
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {event.description}
                </p>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {event.content}
                </p>
              </div>

              {/* 혜택 */}
              {event.benefits && event.benefits.length > 0 && (
                  <div className="mb-6">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      <svg
                          className="w-5 h-5 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                      >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                        />
                      </svg>
                      이벤트 혜택
                    </h3>
                    <ul className="space-y-2">
                      {event.benefits.map((benefit, index) => (
                          <li
                              key={index}
                              className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                          >
                            <svg
                                className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
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
                            {benefit}
                          </li>
                      ))}
                    </ul>
                  </div>
              )}

              {/* 유의사항 */}
              {event.conditions && event.conditions.length > 0 && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      <svg
                          className="w-5 h-5 text-orange-500"
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
                      유의사항
                    </h3>
                    <ul className="space-y-1">
                      {event.conditions.map((condition, index) => (
                          <li
                              key={index}
                              className="text-sm text-gray-600 dark:text-gray-400"
                          >
                            • {condition}
                          </li>
                      ))}
                    </ul>
                  </div>
              )}

              {/* 버튼 */}
              {event.status !== "ENDED" && (
                  <div className="mt-6">
                    <button
                        onClick={handleParticipate}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold transition-all"
                    >
                      이벤트 참여하기
                    </button>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}