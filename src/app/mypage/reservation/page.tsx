"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api";
import { cn } from "@/lib/utils";

interface ReservationItem {
  id: number;
  productId: number;
  productName: string;
  posterImageUrl?: string;
  artHallName: string;
  eventDate: string;
  seatNumber: string;
  grade: string;
  price: number;
  status: "RESERVED" | "CANCELLED" | "USED" | "EXPIRED";
  reservedAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "예매가능",
  PREEMPTED: "선점중",
  RESERVED: "예매완료",
  CANCELLED: "취소됨",
  USED: "사용완료",
  EXPIRED: "기간만료",
};

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  PREEMPTED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  RESERVED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  CANCELLED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  USED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  EXPIRED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

// 더미 데이터
const DUMMY_RESERVATIONS: ReservationItem[] = [
  {
    id: 1,
    productId: 1,
    productName: "2025 아이유 콘서트 - HER",
    posterImageUrl: "https://picsum.photos/seed/iu2025/300/400",
    artHallName: "올림픽공원 KSPO DOME",
    eventDate: "2025-03-15T18:00:00",
    seatNumber: "A12",
    grade: "VIP석",
    price: 199000,
    status: "RESERVED",
    reservedAt: "2025-02-01T10:30:00",
  },
  {
    id: 2,
    productId: 2,
    productName: "뮤지컬 위키드",
    posterImageUrl: "https://picsum.photos/seed/wicked/300/400",
    artHallName: "블루스퀘어 신한카드홀",
    eventDate: "2025-02-20T14:00:00",
    seatNumber: "C5",
    grade: "R석",
    price: 150000,
    status: "USED",
    reservedAt: "2025-01-15T09:00:00",
  },
];

export default function ReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "past">("all");

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        // TODO: 실제 API 연동
        // const response = await fetch(`/api/reservations?customerId=${user?.id}`);
        // const result: ApiResponse<ReservationItem[]> = await response.json();
        // if (result.success && result.data) {
        //   setReservations(result.data);
        // }

        // 더미 데이터 사용
        await new Promise((resolve) => setTimeout(resolve, 500));
        setReservations(DUMMY_RESERVATIONS);
      } catch (error) {
        console.error("Reservations fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, [user]);

  const handleCancel = async (reservationId: number) => {
    if (!confirm("예매를 취소하시겠습니까?")) return;

    try {
      // TODO: 실제 API 연동
      // const response = await fetch(`/api/reservations/${reservationId}/cancel`, {
      //   method: "POST",
      // });

      alert("예매가 취소되었습니다.");
      setReservations((prev) =>
          prev.map((r) =>
              r.id === reservationId ? { ...r, status: "CANCELLED" as const } : r
          )
      );
    } catch (error) {
      console.error("Cancel error:", error);
      alert("취소에 실패했습니다.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  const filteredReservations = reservations.filter((r) => {
    if (filter === "active") return r.status === "RESERVED";
    if (filter === "past") return r.status !== "RESERVED";
    return true;
  });

  if (isLoading) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              예매 내역
            </h1>

            {/* 필터 */}
            <div className="flex gap-2">
              {[
                { key: "all", label: "전체" },
                { key: "active", label: "예매완료" },
                { key: "past", label: "지난예매" },
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

          <div className="p-6">
            {filteredReservations.length === 0 ? (
                <div className="text-center py-12">
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
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                    />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">
                    예매 내역이 없습니다.
                  </p>
                  <Link
                      href="/products"
                      className="inline-block mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                  >
                    공연 둘러보기
                  </Link>
                </div>
            ) : (
                <div className="space-y-4">
                  {filteredReservations.map((reservation) => (
                      <div
                          key={reservation.id}
                          className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                      >
                        {/* 포스터 */}
                        <Link
                            href={`/products/${reservation.productId}`}
                            className="w-20 h-28 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0"
                        >
                          <Image
                              src={reservation.posterImageUrl || `https://picsum.photos/seed/r${reservation.id}/200/280`}
                              alt={reservation.productName}
                              width={80}
                              height={112}
                              className="w-full h-full object-cover"
                          />
                        </Link>

                        {/* 정보 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <Link
                                href={`/products/${reservation.productId}`}
                                className="font-semibold text-gray-900 dark:text-white hover:text-orange-500 transition-colors line-clamp-1"
                            >
                              {reservation.productName}
                            </Link>
                            <span
                                className={cn(
                                    "px-2 py-0.5 rounded text-xs font-medium flex-shrink-0",
                                    STATUS_COLORS[reservation.status]
                                )}
                            >
                        {STATUS_LABELS[reservation.status]}
                      </span>
                          </div>

                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            {reservation.artHallName}
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            {formatDate(reservation.eventDate)} {formatTime(reservation.eventDate)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {reservation.grade} · {reservation.seatNumber} · {formatPrice(reservation.price)}원
                          </p>
                        </div>

                        {/* 액션 */}
                        {reservation.status === "RESERVED" && (
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              <button
                                  onClick={() => handleCancel(reservation.id)}
                                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                취소
                              </button>
                            </div>
                        )}
                      </div>
                  ))}
                </div>
            )}
          </div>
        </div>
      </div>
  );
}