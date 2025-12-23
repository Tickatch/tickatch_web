"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { usePaymentPopup } from "@/hooks/usePaymentPopup";
import { ReservationStatus } from "@/types/reservation";
import { CreatePaymentRequest, PaymentItem } from "@/types/payment";
import { CreateTicketRequest, ReceiveMethod } from "@/types/ticket";
import { cn } from "@/lib/utils";

// 수령 방법 옵션
const RECEIVE_METHOD_OPTIONS: { value: ReceiveMethod; label: string; icon: string; description: string }[] = [
  { value: "ON_SITE", label: "현장 수령", icon: "🏟️", description: "공연장에서 직접 수령" },
  { value: "EMAIL", label: "이메일", icon: "📧", description: "이메일로 티켓 전송" },
  { value: "SMS", label: "SMS", icon: "📱", description: "문자로 티켓 전송" },
];

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

// 예매 상세 응답 타입
interface ReservationDetailResponse {
  id: string;
  reserverId: string;
  reserverName: string;
  productId: number;
  productName: string;
  seatId: number;
  seatNumber: string;
  price: number | null;
  status: ReservationStatus;
  reservationNumber: string;
  createdAt: string;
  updatedAt: string;
}

// 예약 좌석 응답 타입
interface ReservationSeatResponse {
  id: number;
  seatNumber: string;
  grade: string;
  price: number;
  status: string;
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

  // 결제 처리 상태
  const [payingId, setPayingId] = useState<string | null>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  // 티켓 발행 상태
  const [issuingId, setIssuingId] = useState<string | null>(null);

  // 티켓 발행 모달 상태
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedReceiveMethod, setSelectedReceiveMethod] = useState<ReceiveMethod>("ON_SITE");
  const [pendingIssueReservation, setPendingIssueReservation] = useState<ReservationItem | null>(null);

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

  // 결제 성공 핸들러
  const handlePaymentSuccess = useCallback(async (data: { paymentKey: string; orderId: string; amount: number }) => {
    setIsPaymentProcessing(true);
    try {
      const response = await fetch(
          `/api/payments/resp/success?paymentKey=${data.paymentKey}&orderId=${data.orderId}&amount=${data.amount}`
      );
      const result = await response.json();

      if (result.success) {
        alert("결제가 완료되었습니다!");
        // 목록 새로고침
        if (customerId) {
          fetchReservations(currentPage);
        }
      } else {
        alert(result.error?.message || "결제 확정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Payment success callback error:", error);
      alert("결제 확정 중 오류가 발생했습니다.");
    } finally {
      setIsPaymentProcessing(false);
      setPayingId(null);
    }
  }, [customerId, currentPage]);

  // 결제 실패 핸들러
  const handlePaymentFail = useCallback(async (data: { code: string; message: string; orderId?: string }) => {
    if (data.orderId) {
      try {
        await fetch(
            `/api/payments/resp/fail?code=${data.code}&message=${encodeURIComponent(data.message)}&orderId=${data.orderId}`
        );
      } catch (error) {
        console.error("Payment fail callback error:", error);
      }
    }
    alert(data.message || "결제가 취소되었습니다.");
    setIsPaymentProcessing(false);
    setPayingId(null);
  }, []);

  // 결제 취소 핸들러
  const handlePaymentCancel = useCallback(() => {
    alert("결제를 취소하셨습니다.");
    setIsPaymentProcessing(false);
    setPayingId(null);
  }, []);

  // 결제 팝업 훅
  const { openPaymentPopup } = usePaymentPopup({
    onSuccess: handlePaymentSuccess,
    onFail: handlePaymentFail,
    onCancel: handlePaymentCancel,
  });

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

  // 결제하기 (PENDING_PAYMENT 상태)
  const handlePayment = async (reservation: ReservationItem) => {
    if (isPaymentProcessing) return;

    setPayingId(reservation.id);
    setIsPaymentProcessing(true);

    try {
      // 1. 예매 상세 조회 (상품명 등 필요)
      const detailResponse = await fetch(`/api/reservations/${reservation.id}`);
      const detailResult = await detailResponse.json();

      let reservationDetail: ReservationDetailResponse | null = null;
      if (detailResult.success && detailResult.data) {
        reservationDetail = detailResult.data;
      } else if (detailResult.data) {
        reservationDetail = detailResult.data;
      } else if (detailResult.id) {
        reservationDetail = detailResult;
      }

      if (!reservationDetail) {
        throw new Error("예매 정보를 조회할 수 없습니다.");
      }

      // 2. 결제 생성
      const paymentItems: PaymentItem[] = [{
        reservationId: reservation.id,
        price: reservation.price || 0,
      }];

      const paymentRequest: CreatePaymentRequest = {
        orderName: reservationDetail.productName || "공연 예매",
        payments: paymentItems,
      };

      const paymentResponse = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentRequest),
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResult.success) {
        throw new Error(paymentResult.error?.message || "결제 생성에 실패했습니다.");
      }

      const checkoutUrl = paymentResult.data.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error("결제 URL을 받지 못했습니다.");
      }

      // 3. 결제 팝업 열기
      openPaymentPopup(checkoutUrl);

    } catch (error) {
      console.error("Payment error:", error);
      alert(error instanceof Error ? error.message : "결제 요청 중 오류가 발생했습니다.");
      setIsPaymentProcessing(false);
      setPayingId(null);
    }
  };

  // 티켓 발행 모달 열기
  const openIssueModal = (reservation: ReservationItem) => {
    setPendingIssueReservation(reservation);
    setSelectedReceiveMethod("ON_SITE");
    setShowIssueModal(true);
  };

  // 티켓 발행 모달 닫기
  const closeIssueModal = () => {
    setShowIssueModal(false);
    setPendingIssueReservation(null);
    setSelectedReceiveMethod("ON_SITE");
  };

  // 티켓 발행하기 (CONFIRMED 상태)
  const handleIssueTicket = async () => {
    if (!pendingIssueReservation) return;

    const reservation = pendingIssueReservation;
    setIssuingId(reservation.id);
    closeIssueModal();

    try {
      // 1. 예매 상세 조회 (seatNumber, productName 등)
      const detailResponse = await fetch(`/api/reservations/${reservation.id}`);
      const detailResult = await detailResponse.json();

      let reservationDetail: ReservationDetailResponse | null = null;
      if (detailResult.success && detailResult.data) {
        reservationDetail = detailResult.data;
      } else if (detailResult.data) {
        reservationDetail = detailResult.data;
      } else if (detailResult.id) {
        reservationDetail = detailResult;
      }

      if (!reservationDetail) {
        throw new Error("예매 정보를 조회할 수 없습니다.");
      }

      // 2. 예약 좌석 조회 (grade 정보 획득)
      const seatsResponse = await fetch(`/api/reservation-seats?productId=${reservation.productId}`);
      const seatsResult = await seatsResponse.json();

      let reservationSeats: ReservationSeatResponse[] = [];
      if (seatsResult.success && seatsResult.data) {
        reservationSeats = Array.isArray(seatsResult.data)
            ? seatsResult.data
            : seatsResult.data.content || [];
      } else if (Array.isArray(seatsResult.data)) {
        reservationSeats = seatsResult.data;
      } else if (seatsResult.content) {
        reservationSeats = seatsResult.content;
      }

      // seatNumber로 해당 좌석의 grade 찾기
      const matchingSeat = reservationSeats.find(
          seat => seat.seatNumber === reservationDetail!.seatNumber
      );

      const grade = matchingSeat?.grade || "일반";

      // 3. 티켓 생성 요청
      const ticketRequest: CreateTicketRequest = {
        reservationId: reservation.id,
        seatId: reservation.seatId,
        productId: reservation.productId,
        seatNumber: reservationDetail.seatNumber,
        grade: grade,
        price: reservation.price,
        receiveMethod: selectedReceiveMethod,
      };

      const ticketResponse = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketRequest),
      });

      const ticketResult = await ticketResponse.json();

      if (ticketResult.success) {
        alert("티켓이 발행되었습니다!");
        // 목록 새로고침
        fetchReservations(currentPage);
      } else {
        throw new Error(ticketResult.error?.message || "티켓 발행에 실패했습니다.");
      }

    } catch (error) {
      console.error("Issue ticket error:", error);
      alert(error instanceof Error ? error.message : "티켓 발행 중 오류가 발생했습니다.");
    } finally {
      setIssuingId(null);
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

                          {/* 하단: 액션 버튼들 */}
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                            {/* 결제 대기 상태 → 결제하기 버튼 */}
                            {reservation.status === "PENDING_PAYMENT" && (
                                <button
                                    onClick={() => handlePayment(reservation)}
                                    disabled={payingId === reservation.id || isPaymentProcessing}
                                    className={cn(
                                        "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
                                        payingId === reservation.id || isPaymentProcessing
                                            ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white"
                                    )}
                                >
                                  {payingId === reservation.id ? (
                                      <span className="flex items-center gap-2">
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              처리 중...
                            </span>
                                  ) : (
                                      "결제하기"
                                  )}
                                </button>
                            )}

                            {/* 예매 완료 상태 → 발행하기 버튼 */}
                            {reservation.status === "CONFIRMED" && (
                                <>
                                  <button
                                      onClick={() => openIssueModal(reservation)}
                                      disabled={issuingId === reservation.id}
                                      className={cn(
                                          "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
                                          issuingId === reservation.id
                                              ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                                              : "bg-blue-500 hover:bg-blue-600 text-white"
                                      )}
                                  >
                                    {issuingId === reservation.id ? (
                                        <span className="flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                발행 중...
                              </span>
                                    ) : (
                                        "티켓 발행"
                                    )}
                                  </button>

                                  {/* 예매 취소 버튼 */}
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
                                </>
                            )}
                          </div>
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

        {/* 티켓 발행 모달 */}
        {showIssueModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* 배경 오버레이 */}
              <div
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={closeIssueModal}
              />

              {/* 모달 컨텐츠 */}
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                {/* 헤더 */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      티켓 발행
                    </h3>
                    <button
                        onClick={closeIssueModal}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    티켓 수령 방법을 선택해주세요
                  </p>
                </div>

                {/* 수령 방법 선택 */}
                <div className="p-6 space-y-3">
                  {RECEIVE_METHOD_OPTIONS.map((option) => (
                      <button
                          key={option.value}
                          onClick={() => setSelectedReceiveMethod(option.value)}
                          className={cn(
                              "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
                              selectedReceiveMethod === option.value
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          )}
                      >
                        <span className="text-2xl">{option.icon}</span>
                        <div className="flex-1 text-left">
                          <p className={cn(
                              "font-medium",
                              selectedReceiveMethod === option.value
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-gray-900 dark:text-white"
                          )}>
                            {option.label}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {option.description}
                          </p>
                        </div>
                        {selectedReceiveMethod === option.value && (
                            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        )}
                      </button>
                  ))}
                </div>

                {/* 푸터 */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex gap-3">
                  <button
                      onClick={closeIssueModal}
                      className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    취소
                  </button>
                  <button
                      onClick={handleIssueTicket}
                      className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                  >
                    발행하기
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}