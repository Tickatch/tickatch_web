"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import {
  ReservationStatus,
} from "@/types/reservation";
import { cn } from "@/lib/utils";

// API 응답 타입 (목록용)
interface ReservationItem {
  id: string;
  reserverId: string;
  productId: number;
  seatId: number;
  price: number | null;
  status: ReservationStatus;
  reservationNumber: string;
}

interface PageInfo {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  INIT: "예매 생성",
  PENDING_PAYMENT: "결제 대기",
  CONFIRMED: "예매완료",
  PAYMENT_FAILED: "결제 실패",
  CANCELED: "취소됨",
  EXPIRED: "만료됨",
};

const STATUS_COLORS: Record<string, string> = {
  INIT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  CONFIRMED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  PAYMENT_FAILED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  CANCELED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  EXPIRED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
};

export default function ReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "past">("all");
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

  // 페이지네이션 상태
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    pageNumber: 0,
    pageSize: 20,
    totalPages: 0,
    totalElements: 0,
    first: true,
    last: true,
  });
  const [currentPage, setCurrentPage] = useState(0);

  // 내 정보 조회
  useEffect(() => {
    const fetchCustomerId = async () => {
      try {
        const meResponse = await fetch("/api/user/customers/me");
        const meResult = await meResponse.json();

        if (meResult.success && meResult.data?.id) {
          setCustomerId(meResult.data.id);
        } else {
          setError("사용자 정보를 불러올 수 없습니다.");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Fetch customer error:", err);
        setError("사용자 정보를 불러올 수 없습니다.");
        setIsLoading(false);
      }
    };

    fetchCustomerId();
  }, []);

  // 예매 목록 조회
  const fetchReservations = useCallback(async (page: number = 0) => {
    if (!customerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
          `/api/reservations/${customerId}/list?page=${page}&size=20`
      );
      const result = await response.json();

      if (result.success !== false && result.data) {
        const data = result.data;
        setReservations(data.content || []);
        setPageInfo({
          pageNumber: data.pageable?.pageNumber ?? data.number ?? 0,
          pageSize: data.pageable?.pageSize ?? data.size ?? 20,
          totalPages: data.totalPages ?? 0,
          totalElements: data.totalElements ?? 0,
          first: data.first ?? true,
          last: data.last ?? true,
        });
      } else {
        setError(result.error?.message || "예매 목록을 불러오는데 실패했습니다.");
      }
    } catch (err) {
      console.error("Fetch reservations error:", err);
      setError("예매 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  // customerId가 설정되면 예매 목록 조회
  useEffect(() => {
    if (customerId) {
      fetchReservations(currentPage);
    }
  }, [customerId, currentPage, fetchReservations]);

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 예매 취소
  const handleCancel = async (reservationId: string) => {
    if (!confirm("예매를 취소하시겠습니까?")) return;

    setCancelingId(reservationId);

    try {
      const response = await fetch(`/api/reservations/${reservationId}/cancel`, {
        method: "POST",
      });

      const result = await response.json();

      if (response.ok || result.success) {
        alert("예매가 취소되었습니다.");
        fetchReservations(currentPage);
      } else {
        alert(result.error?.message || result.error || "취소에 실패했습니다.");
      }
    } catch (err) {
      console.error("Cancel error:", err);
      alert("취소에 실패했습니다.");
    } finally {
      setCancelingId(null);
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return "-";
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  // 필터링
  const filteredReservations = reservations.filter((r) => {
    if (filter === "active") return r.status === "CONFIRMED" || r.status === "PENDING_PAYMENT";
    if (filter === "past") return r.status === "CANCELED" || r.status === "EXPIRED" || r.status === "PAYMENT_FAILED";
    return true;
  });

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(pageInfo.totalPages, start + maxVisible);

    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }

    for (let i = start; i < end; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (isLoading && reservations.length === 0) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
                onClick={() => fetchReservations(currentPage)}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                예매 내역
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
              총 {pageInfo.totalElements}건
            </span>
            </div>

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
                              src={`https://picsum.photos/seed/p${reservation.productId}/200/280`}
                              alt="상품 이미지"
                              width={80}
                              height={112}
                              className="w-full h-full object-cover"
                          />
                        </Link>

                        {/* 정보 */}
                        <div className="flex-1 min-w-0 flex flex-col">
                          {/* 상단: 예매번호 + 상태 뱃지 */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                예매번호
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {reservation.reservationNumber}
                              </p>
                            </div>
                            <span
                                className={cn(
                                    "px-2 py-0.5 rounded text-xs font-medium flex-shrink-0",
                                    STATUS_COLORS[reservation.status] || "bg-gray-100 text-gray-600"
                                )}
                            >
                        {STATUS_LABELS[reservation.status] || reservation.status}
                      </span>
                          </div>

                          {/* 중간: 상세 정보 */}
                          <div className="flex-1">
                            <Link
                                href={`/products/${reservation.productId}`}
                                className="text-sm text-orange-500 hover:text-orange-600 hover:underline"
                            >
                              상품 상세보기 →
                            </Link>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              좌석 ID: {reservation.seatId}
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                              {formatPrice(reservation.price)}원
                            </p>
                          </div>

                          {/* 하단: 취소 버튼 */}
                          {reservation.status === "CONFIRMED" && (
                              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => handleCancel(reservation.id)}
                                    disabled={cancelingId === reservation.id}
                                    className={cn(
                                        "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
                                        cancelingId === reservation.id
                                            ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                                            : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800"
                                    )}
                                >
                                  {cancelingId === reservation.id ? "취소 중..." : "예매 취소"}
                                </button>
                              </div>
                          )}
                        </div>
                      </div>
                  ))}
                </div>
            )}

            {/* 페이지네이션 */}
            {pageInfo.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-1">
                  {/* 이전 버튼 */}
                  <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={pageInfo.first}
                      className={cn(
                          "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          pageInfo.first
                              ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* 페이지 번호 */}
                  {getPageNumbers().map((page) => (
                      <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={cn(
                              "w-10 h-10 rounded-lg text-sm font-medium transition-colors",
                              currentPage === page
                                  ? "bg-orange-500 text-white"
                                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                          )}
                      >
                        {page + 1}
                      </button>
                  ))}

                  {/* 다음 버튼 */}
                  <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={pageInfo.last}
                      className={cn(
                          "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          pageInfo.last
                              ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}