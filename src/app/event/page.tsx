"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Header from "@/components/common/Header";
import EventDetailModal, {
  EventItem,
  EVENT_STATUS_LABELS,
  EVENT_STATUS_COLORS,
} from "@/components/common/EventDetailModal";
import { cn } from "@/lib/utils";

// 더미 데이터 - 2025년 12월 17일 기준
const DUMMY_EVENTS: EventItem[] = [
  {
    id: 1,
    title: "연말 특별 할인 이벤트",
    description: "전 공연 예매 시 최대 20% 할인!",
    content:
        "2025년 한 해 동안 TICKATCH를 사랑해주신 고객님께 감사드리며, 연말 특별 할인 이벤트를 준비했습니다.\n\n이벤트 기간 동안 전 공연 예매 시 결제 금액의 10~20%를 할인받으실 수 있습니다.",
    imageUrl: "https://picsum.photos/seed/event-yearend/800/400",
    startDate: "2025-12-15",
    endDate: "2025-12-31",
    status: "ONGOING",
    benefits: [
      "일반 회원: 10% 할인",
      "VIP 회원: 15% 할인",
      "VVIP 회원: 20% 할인",
    ],
    conditions: [
      "다른 할인 쿠폰과 중복 사용 불가",
      "1인당 최대 4매까지 적용",
      "일부 프리미엄 공연 제외",
    ],
  },
  {
    id: 2,
    title: "크리스마스 기프트 이벤트",
    description: "예매하고 스타벅스 커피 쿠폰 받자!",
    content:
        "크리스마스를 맞아 특별한 선물을 준비했습니다.\n\n이벤트 기간 동안 5만원 이상 예매 시 스타벅스 아메리카노 쿠폰을 드립니다!",
    imageUrl: "https://picsum.photos/seed/event-xmas/800/400",
    startDate: "2025-12-20",
    endDate: "2025-12-25",
    status: "UPCOMING",
    benefits: [
      "5만원 이상 예매: 아메리카노(T) 1잔",
      "10만원 이상 예매: 아메리카노(T) 2잔",
      "20만원 이상 예매: 아메리카노(T) 3잔 + 조각케이크",
    ],
    conditions: [
      "예매 완료 후 3일 이내 카카오톡으로 발송",
      "쿠폰 유효기간: 발급일로부터 30일",
      "예매 취소 시 쿠폰 회수",
    ],
  },
  {
    id: 3,
    title: "신규 회원 웰컴 이벤트",
    description: "가입만 해도 5,000원 할인 쿠폰 증정!",
    content:
        "TICKATCH에 새로 가입하시는 모든 분들께 웰컴 쿠폰을 드립니다.\n\n지금 바로 가입하고 첫 예매 시 할인 혜택을 받아보세요!",
    imageUrl: "https://picsum.photos/seed/event-welcome/800/400",
    startDate: "2025-12-01",
    endDate: "2026-01-31",
    status: "ONGOING",
    benefits: [
      "신규 가입 즉시 5,000원 할인 쿠폰 지급",
      "첫 예매 시 추가 3,000원 할인 쿠폰",
      "앱 설치 시 2,000원 추가 쿠폰",
    ],
    conditions: [
      "쿠폰 유효기간: 발급일로부터 30일",
      "최소 주문금액 30,000원 이상",
      "1인 1회 한정",
    ],
  },
  {
    id: 4,
    title: "11월 뮤지컬 특별전",
    description: "인기 뮤지컬 최대 30% 할인",
    content:
        "11월 한 달간 진행된 뮤지컬 특별전이 성황리에 종료되었습니다.\n\n많은 관심과 참여 감사드립니다!",
    imageUrl: "https://picsum.photos/seed/event-musical/800/400",
    startDate: "2025-11-01",
    endDate: "2025-11-30",
    status: "ENDED",
    benefits: [
      "인기 뮤지컬 20~30% 할인",
      "2+1 이벤트 (3매 예매 시 1매 무료)",
    ],
    conditions: ["이벤트 종료"],
  },
];

export default function EventPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "ongoing" | "ended">("all");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // TODO: 실제 API 연동
        await new Promise((resolve) => setTimeout(resolve, 500));
        setEvents(DUMMY_EVENTS);
      } catch (error) {
        console.error("Events fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleParticipate = (event: EventItem) => {
    // TODO: 이벤트 참여 로직 구현
    alert(`"${event.title}" 이벤트에 참여합니다!`);
  };

  const filteredEvents = events.filter((e) => {
    if (filter === "ongoing")
      return e.status === "ONGOING" || e.status === "UPCOMING";
    if (filter === "ended") return e.status === "ENDED";
    return true;
  });

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header userType="CUSTOMER" bannerHeight={0} />

        <div className="pt-16">
          <div className="max-w-[1200px] mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                이벤트
              </h1>

              {/* 필터 */}
              <div className="flex gap-2">
                {[
                  { key: "all", label: "전체" },
                  { key: "ongoing", label: "진행중" },
                  { key: "ended", label: "종료" },
                ].map((item) => (
                    <button
                        key={item.key}
                        onClick={() => setFilter(item.key as typeof filter)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                            filter === item.key
                                ? "bg-orange-500 text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                    >
                      {item.label}
                    </button>
                ))}
              </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-[2/1] rounded-xl bg-gray-200 dark:bg-gray-800" />
                        <div className="mt-3 h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                        <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                      </div>
                  ))}
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
                  <svg
                      className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">
                    {filter === "ended"
                        ? "종료된 이벤트가 없습니다."
                        : "진행 중인 이벤트가 없습니다."}
                  </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredEvents.map((event) => (
                      <button
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden group text-left transition-all hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-700"
                      >
                        <div className="relative aspect-[2/1] overflow-hidden">
                          <Image
                              src={event.imageUrl}
                              alt={event.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute top-3 left-3">
                      <span
                          className={cn(
                              "px-2 py-1 rounded text-xs font-medium",
                              EVENT_STATUS_COLORS[event.status]
                          )}
                      >
                        {EVENT_STATUS_LABELS[event.status]}
                      </span>
                          </div>
                          {/* 호버 시 자세히 보기 */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="px-4 py-2 bg-white/90 dark:bg-gray-900/90 rounded-full text-sm font-medium text-gray-900 dark:text-white">
                        자세히 보기
                      </span>
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-orange-500 transition-colors">
                            {event.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
                            {event.description}
                          </p>
                          <p className="text-sm text-gray-400 dark:text-gray-500">
                            {formatDate(event.startDate)} ~{" "}
                            {formatDate(event.endDate)}
                          </p>
                        </div>
                      </button>
                  ))}
                </div>
            )}
          </div>
        </div>

        {/* 이벤트 상세 모달 */}
        {selectedEvent && (
            <EventDetailModal
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onParticipate={handleParticipate}
            />
        )}
      </div>
  );
}