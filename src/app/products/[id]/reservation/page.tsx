"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import Header from "@/components/common/Header";
import { ProductResponse } from "@/types/product";
import { StageSeatListItem } from "@/types/venue";
import {
  ReservationSeatResponse,
  ReservationSeatStatus,
} from "@/types/reservation-seat";
import {
  PaymentRequest,
  PaymentResponse,
  generateOrderId,
} from "@/types/payment";
import { ApiResponse } from "@/types/api";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

// Toss Payments 타입 (팝업 실패 시 fallback용)
declare global {
  interface Window {
    TossPayments: (clientKey: string) => Promise<{
      payment: (options: { customerKey: string }) => {
        requestPayment: (options: {
          method: string;
          amount: { currency: string; value: number };
          orderId: string;
          orderName: string;
          customerName: string;
          successUrl: string;
          failUrl: string;
        }) => Promise<void>;
      };
    }>;
  }
}

// 더미 상품
const DUMMY_PRODUCT: ProductResponse = {
  id: 1,
  name: "2025 아이유 콘서트 - HER",
  productType: "CONCERT",
  status: "ON_SALE",
  startAt: "2025-03-15T18:00:00",
  endAt: "2025-03-17T21:00:00",
  saleStartAt: "2025-02-01T10:00:00",
  saleEndAt: "2025-03-14T23:59:59",
  runningTime: 150,
  stageId: 1,
  stageName: "메인홀",
  artHallId: 1,
  artHallName: "올림픽공원 KSPO DOME",
  artHallAddress: "서울특별시 송파구 올림픽로 424",
  posterImageUrl: "https://picsum.photos/seed/iu2025/600/800",
  ageRating: "ALL",
  maxTicketsPerPerson: 4,
  idVerificationRequired: true,
  transferable: false,
  admissionMinutesBefore: 30,
  lateEntryAllowed: false,
  hasIntermission: true,
  intermissionMinutes: 20,
  photographyAllowed: false,
  foodAllowed: false,
  cancellable: true,
  cancelDeadlineDays: 7,
  seatGrades: [
    { gradeName: "VIP석", price: 199000, totalSeats: 100, availableSeats: 30 },
    { gradeName: "R석", price: 154000, totalSeats: 200, availableSeats: 80 },
    { gradeName: "S석", price: 121000, totalSeats: 300, availableSeats: 150 },
    { gradeName: "A석", price: 99000, totalSeats: 200, availableSeats: 100 },
  ],
  totalSeats: 800,
  availableSeats: 360,
  viewCount: 15420,
  sellerId: "seller-001",
  createdAt: "2025-01-15T10:00:00",
  updatedAt: "2025-02-20T15:30:00",
};

// 더미 스테이지 좌석 (10x20)
const generateDummyStageSeats = (): StageSeatListItem[] => {
  const seats: StageSeatListItem[] = [];
  let id = 1;
  for (let row = 1; row <= 10; row++) {
    for (let col = 1; col <= 20; col++) {
      seats.push({
        id: id++,
        seatNumber: `${String.fromCharCode(64 + row)}${col}`,
        status: "ACTIVE",
        row,
        col,
        vector: [col * 40, row * 40],
      });
    }
  }
  return seats;
};

// 더미 예약 좌석
const generateDummyReservationSeats = (
    stageSeats: StageSeatListItem[]
): ReservationSeatResponse[] => {
  const grades = ["VIP석", "R석", "S석", "A석"];
  const prices = [199000, 154000, 121000, 99000];
  const statuses: ReservationSeatStatus[] = [
    "AVAILABLE",
    "AVAILABLE",
    "AVAILABLE",
    "PREEMPTED",
    "RESERVED",
  ];

  return stageSeats.map((seat, index) => {
    const gradeIndex =
        seat.row <= 2 ? 0 : seat.row <= 4 ? 1 : seat.row <= 7 ? 2 : 3;
    const rand = Math.random();
    const statusIndex =
        rand > 0.9 ? 4 : rand > 0.85 ? 3 : Math.floor(Math.random() * 3);

    return {
      id: 1000 + index,
      seatNumber: seat.seatNumber,
      grade: grades[gradeIndex],
      price: prices[gradeIndex],
      status: statuses[statusIndex],
    };
  });
};

// 합쳐진 좌석 타입
interface CombinedSeat {
  id: number;
  reservationSeatId: number;
  seatNumber: string;
  row: number;
  col: number;
  vectorX: number;
  vectorY: number;
  grade: string;
  price: number;
  status: ReservationSeatStatus;
  isSelectable: boolean;
}

// 동적 등급 색상 팔레트 (순서대로 적용)
const GRADE_COLOR_PALETTE = [
  { bg: "bg-purple-500", border: "border-purple-600", text: "text-purple-700 dark:text-purple-300", light: "bg-purple-100 dark:bg-purple-900/40" },
  { bg: "bg-amber-500", border: "border-amber-600", text: "text-amber-700 dark:text-amber-300", light: "bg-amber-100 dark:bg-amber-900/40" },
  { bg: "bg-blue-500", border: "border-blue-600", text: "text-blue-700 dark:text-blue-300", light: "bg-blue-100 dark:bg-blue-900/40" },
  { bg: "bg-emerald-500", border: "border-emerald-600", text: "text-emerald-700 dark:text-emerald-300", light: "bg-emerald-100 dark:bg-emerald-900/40" },
  { bg: "bg-rose-500", border: "border-rose-600", text: "text-rose-700 dark:text-rose-300", light: "bg-rose-100 dark:bg-rose-900/40" },
  { bg: "bg-cyan-500", border: "border-cyan-600", text: "text-cyan-700 dark:text-cyan-300", light: "bg-cyan-100 dark:bg-cyan-900/40" },
  { bg: "bg-indigo-500", border: "border-indigo-600", text: "text-indigo-700 dark:text-indigo-300", light: "bg-indigo-100 dark:bg-indigo-900/40" },
  { bg: "bg-orange-500", border: "border-orange-600", text: "text-orange-700 dark:text-orange-300", light: "bg-orange-100 dark:bg-orange-900/40" },
];

export default function ReservationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, userType } = useAuth();
  const productId = params.id as string;
  const paymentPopupRef = useRef<Window | null>(null);

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [combinedSeats, setCombinedSeats] = useState<CombinedSeat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<CombinedSeat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tossLoaded, setTossLoaded] = useState(false);
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<{
    orderId: string;
    amount: number;
    orderName: string;
  } | null>(null);

  // 인증 체크
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${productId}/reservation`);
    }
  }, [isAuthenticated, productId, router]);

  // URL 파라미터로 결제 결과 처리
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (paymentStatus === "success" && paymentKey && orderId && amount) {
      handlePaymentSuccess(paymentKey, orderId, Number(amount));
    } else if (paymentStatus === "fail") {
      alert("결제가 취소되었습니다.");
      router.replace(`/products/${productId}/reservation`);
    }
  }, [searchParams, productId, router]);

  // 결제 성공 처리 (확정 요청)
  const handlePaymentSuccess = async (
      paymentKey: string,
      orderId: string,
      amount: number
  ) => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        alert("예매가 완료되었습니다!");
        router.push(`/products/${productId}`);
      } else {
        alert(result.error?.message || "결제 확정에 실패했습니다.");
        router.replace(`/products/${productId}/reservation`);
      }
    } catch (error) {
      console.error("Payment confirm error:", error);
      alert("결제 확정 중 오류가 발생했습니다.");
      router.replace(`/products/${productId}/reservation`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. 상품 정보
        let productData: ProductResponse = DUMMY_PRODUCT;
        try {
          const res = await fetch(`/api/products/${productId}`);
          if (res.ok) {
            const result = await res.json();
            if (result.data) productData = result.data;
          }
        } catch {
          console.log("Using dummy product");
        }
        setProduct(productData);

        // 2. 스테이지 좌석
        let stageSeatData = generateDummyStageSeats();
        if (productData.stageId) {
          try {
            const res = await fetch(
                `/api/arthalls/stages/${productData.stageId}/stage-seats`
            );
            if (res.ok) {
              const result = await res.json();
              if (result.data?.content?.length > 0) {
                stageSeatData = result.data.content;
              }
            }
          } catch {
            console.log("Using dummy stage seats");
          }
        }

        // 3. 예약 좌석
        let reservationSeatData = generateDummyReservationSeats(stageSeatData);
        try {
          const res = await fetch(
              `/api/products/${productId}/reservation-seats`
          );
          if (res.ok) {
            const result = await res.json();
            if (result.data?.length > 0) {
              reservationSeatData = result.data;
            }
          }
        } catch {
          console.log("Using dummy reservation seats");
        }

        // 4. 합치기
        const combined = combineSeats(stageSeatData, reservationSeatData);
        setCombinedSeats(combined);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) fetchData();
  }, [productId]);

  // 좌석 정보 합치기
  const combineSeats = (
      stageSeats: StageSeatListItem[],
      reservationSeats: ReservationSeatResponse[]
  ): CombinedSeat[] => {
    const map = new Map(reservationSeats.map((s) => [s.seatNumber, s]));

    return stageSeats.map((stageSeat) => {
      const rSeat = map.get(stageSeat.seatNumber);
      const status: ReservationSeatStatus = rSeat?.status || "AVAILABLE";
      // 선택 가능: 예약좌석에 존재하고 AVAILABLE인 경우만
      const isSelectable = rSeat !== undefined && status === "AVAILABLE";

      return {
        id: stageSeat.id,
        reservationSeatId: rSeat?.id || 0,
        seatNumber: stageSeat.seatNumber,
        row: stageSeat.row,
        col: stageSeat.col,
        vectorX: stageSeat.vector?.[0] || stageSeat.col * 40,
        vectorY: stageSeat.vector?.[1] || stageSeat.row * 40,
        grade: rSeat?.grade || "일반",
        price: rSeat?.price || 0,
        status,
        isSelectable,
      };
    });
  };

  // 등급별 색상 매핑 (product.seatGrades 순서대로)
  const gradeColorMap = new Map<string, typeof GRADE_COLOR_PALETTE[0]>();
  product?.seatGrades?.forEach((grade, index) => {
    gradeColorMap.set(grade.gradeName, GRADE_COLOR_PALETTE[index % GRADE_COLOR_PALETTE.length]);
  });

  // 좌석 선택/해제
  const handleSeatClick = useCallback(
      (seat: CombinedSeat) => {
        if (!seat.isSelectable) return;

        const maxSeats = product?.maxTicketsPerPerson || 4;
        const isSelected = selectedSeats.some((s) => s.id === seat.id);

        if (isSelected) {
          setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
        } else {
          if (selectedSeats.length >= maxSeats) {
            alert(`최대 ${maxSeats}매까지 선택 가능합니다.`);
            return;
          }
          setSelectedSeats((prev) => [...prev, seat]);
        }
      },
      [selectedSeats, product?.maxTicketsPerPerson]
  );

  // 좌석 스타일 (등급별 동적 색상 적용)
  const getSeatStyle = (seat: CombinedSeat, isSelected: boolean) => {
    if (isSelected) {
      return "bg-orange-500 text-white border-orange-600 shadow-lg scale-110";
    }
    if (!seat.isSelectable) {
      if (seat.status === "RESERVED") {
        return "bg-red-200 dark:bg-red-900/50 text-red-400 border-red-300 cursor-not-allowed";
      }
      if (seat.status === "PREEMPTED") {
        return "bg-yellow-200 dark:bg-yellow-900/50 text-yellow-600 border-yellow-300 cursor-not-allowed";
      }
      return "bg-gray-200 dark:bg-gray-800 text-gray-400 border-gray-300 cursor-not-allowed";
    }
    // 선택 가능: 등급별 색상 적용
    const gradeColor = gradeColorMap.get(seat.grade);
    if (gradeColor) {
      return `${gradeColor.light} ${gradeColor.text} ${gradeColor.border} hover:opacity-80 cursor-pointer`;
    }
    return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 cursor-pointer";
  };

  // 총 금액
  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  // 등급별 요약
  const gradesSummary = selectedSeats.reduce(
      (acc, seat) => {
        if (!acc[seat.grade]) acc[seat.grade] = { count: 0, price: seat.price };
        acc[seat.grade].count++;
        return acc;
      },
      {} as Record<string, { count: number; price: number }>
  );

  // 결제하기
  const handlePayment = async () => {
    if (selectedSeats.length === 0) {
      alert("좌석을 선택해주세요.");
      return;
    }

    setIsProcessing(true);

    try {
      const orderId = generateOrderId();
      const orderName = `${product?.name} - ${selectedSeats.map((s) => s.seatNumber).join(", ")}`;

      // 1. 결제 요청 API
      const paymentRequest: PaymentRequest = {
        productId: Number(productId),
        seatIds: selectedSeats.map((s) => s.reservationSeatId),
        amount: totalPrice,
        orderName,
      };

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentRequest),
      });

      const result: ApiResponse<PaymentResponse> = await response.json();

      if (result.success && result.data?.checkoutUrl) {
        // 2. 결제창 URL → 팝업
        const popup = window.open(
            result.data.checkoutUrl,
            "paymentPopup",
            "width=500,height=700,scrollbars=yes"
        );

        if (popup) {
          paymentPopupRef.current = popup;
          const checkPopup = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkPopup);
              paymentPopupRef.current = null;
              setIsProcessing(false);
            }
          }, 500);
        } else {
          // 팝업 차단 → fallback
          setPendingPayment({
            orderId: result.data.orderId,
            amount: totalPrice,
            orderName,
          });
          setShowFallbackModal(true);
          setIsProcessing(false);
        }
      } else {
        // 3. URL 없음 → fallback 모달
        setPendingPayment({ orderId, amount: totalPrice, orderName });
        setShowFallbackModal(true);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("결제 요청 중 오류가 발생했습니다.");
      setIsProcessing(false);
    }
  };

  // Fallback 결제 (토스 SDK)
  const handleFallbackPayment = async () => {
    if (!pendingPayment || !tossLoaded || !window.TossPayments) {
      alert("결제 모듈을 불러오는 중입니다.");
      return;
    }

    setIsProcessing(true);
    setShowFallbackModal(false);

    try {
      const clientKey = "test_ck_yZqmkKeP8g4baNqxOKLp3bQRxB9l";
      const tossPayments = await window.TossPayments(clientKey);

      let customerKey = localStorage.getItem("customerKey");
      if (!customerKey) {
        customerKey = crypto.randomUUID();
        localStorage.setItem("customerKey", customerKey);
      }

      const payment = tossPayments.payment({ customerKey });

      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: pendingPayment.amount },
        orderId: pendingPayment.orderId,
        orderName: pendingPayment.orderName,
        customerName: user?.email?.split("@")[0] || "고객",
        successUrl: `${window.location.origin}/products/${productId}/reservation?payment=success`,
        failUrl: `${window.location.origin}/products/${productId}/reservation?payment=fail`,
      });
    } catch (error) {
      console.error("Fallback payment error:", error);
      alert("결제 요청 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
      setPendingPayment(null);
    }
  };

  // 좌석맵 크기
  const seatMapWidth =
      combinedSeats.length > 0
          ? Math.max(...combinedSeats.map((s) => s.vectorX)) + 60
          : 800;
  const seatMapHeight =
      combinedSeats.length > 0
          ? Math.max(...combinedSeats.map((s) => s.vectorY)) + 60
          : 400;

  // 로딩
  if (isLoading || !product) {
    return (
        <>
          <Header userType={userType || "CUSTOMER"} />
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </>
    );
  }

  return (
      <>
        <Script
            src="https://js.tosspayments.com/v2/standard"
            onLoad={() => setTossLoaded(true)}
        />

        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <Header userType={userType || "CUSTOMER"} />

          <main className="pt-16">
            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
              {/* 좌석 배치도 */}
              <div className="flex-1 p-4 lg:p-6 overflow-auto">
                {/* 등급별 범례 */}
                {product.seatGrades && product.seatGrades.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-4 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">좌석 등급:</span>
                      {product.seatGrades.map((grade, index) => {
                        const color = GRADE_COLOR_PALETTE[index % GRADE_COLOR_PALETTE.length];
                        return (
                            <div key={grade.gradeName} className="flex items-center gap-1.5">
                              <div className={cn("w-5 h-5 rounded border", color.light, color.border)} />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                          {grade.gradeName}
                        </span>
                              <span className="text-sm text-gray-500 dark:text-gray-500">
                          {grade.price.toLocaleString()}원
                        </span>
                              <span className={cn(
                                  "text-xs px-1.5 py-0.5 rounded",
                                  grade.availableSeats > 0
                                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              )}>
                          {grade.availableSeats > 0 ? `${grade.availableSeats}석` : "매진"}
                        </span>
                            </div>
                        );
                      })}
                    </div>
                )}

                {/* 상태별 범례 */}
                <div className="flex flex-wrap gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-orange-500 border border-orange-600" />
                    <span className="text-gray-600 dark:text-gray-400">
                    선택됨
                  </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-yellow-200 dark:bg-yellow-900/50 border border-yellow-300" />
                    <span className="text-gray-600 dark:text-gray-400">
                    선점 중
                  </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-red-200 dark:bg-red-900/50 border border-red-300" />
                    <span className="text-gray-600 dark:text-gray-400">
                    예약됨
                  </span>
                  </div>
                </div>

                {/* 스테이지 */}
                <div className="mb-6 text-center">
                  <div className="inline-block px-20 py-3 bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-t-3xl text-gray-700 dark:text-gray-200 font-semibold">
                    STAGE
                  </div>
                </div>

                {/* 좌석 */}
                <div className="overflow-auto pb-4">
                  <div
                      className="relative mx-auto bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800"
                      style={{
                        width: Math.max(seatMapWidth, 800),
                        height: Math.max(seatMapHeight, 400),
                      }}
                  >
                    {combinedSeats.map((seat) => {
                      const isSelected = selectedSeats.some(
                          (s) => s.id === seat.id
                      );
                      return (
                          <button
                              key={seat.id}
                              onClick={() => handleSeatClick(seat)}
                              disabled={!seat.isSelectable}
                              className={cn(
                                  "absolute w-8 h-8 rounded text-xs font-medium border transition-all duration-150 flex items-center justify-center",
                                  getSeatStyle(seat, isSelected)
                              )}
                              style={{ left: seat.vectorX, top: seat.vectorY }}
                              title={`${seat.seatNumber} - ${seat.grade} (${seat.price.toLocaleString()}원)`}
                          >
                            {seat.status === "RESERVED" ? (
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
                                      d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                            ) : (
                                seat.seatNumber.slice(-2)
                            )}
                          </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 사이드바 */}
              <div className="lg:w-[380px] bg-white dark:bg-gray-900 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800">
                <div className="sticky top-16 p-4 lg:p-6">
                  {/* 공연 정보 */}
                  <div className="flex gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="w-20 h-28 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                      <Image
                          src={
                              product.posterImageUrl ||
                              "https://picsum.photos/seed/default/200/280"
                          }
                          alt={product.name}
                          width={80}
                          height={112}
                          className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                        {product.name}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {product.artHallName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        최대 {product.maxTicketsPerPerson}매 선택 가능
                      </p>
                    </div>
                  </div>

                  {/* 선택 좌석 */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      선택 좌석 ({selectedSeats.length}/
                      {product.maxTicketsPerPerson})
                    </h3>

                    {selectedSeats.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">
                          좌석을 선택해주세요
                        </p>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-auto">
                          {selectedSeats.map((seat) => {
                            const gradeColor = gradeColorMap.get(seat.grade);
                            return (
                                <div
                                    key={seat.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                                >
                                  <div className="flex items-center gap-3">
                              <span
                                  className={cn(
                                      "px-2 py-0.5 rounded text-xs font-medium text-white",
                                      gradeColor?.bg || "bg-gray-500"
                                  )}
                              >
                                {seat.grade}
                              </span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                {seat.seatNumber}
                              </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {seat.price.toLocaleString()}원
                              </span>
                                    <button
                                        onClick={() => handleSeatClick(seat)}
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
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
                                  </div>
                                </div>
                            );
                          })}
                        </div>
                    )}
                  </div>

                  {/* 등급별 요약 */}
                  {Object.keys(gradesSummary).length > 0 && (
                      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                          등급별 선택 현황
                        </h4>
                        <div className="space-y-1">
                          {Object.entries(gradesSummary).map(
                              ([grade, { count, price }]) => (
                                  <div
                                      key={grade}
                                      className="flex justify-between text-sm"
                                  >
                            <span className="text-gray-600 dark:text-gray-400">
                              {grade} x {count}
                            </span>
                                    <span className="text-gray-900 dark:text-white">
                              {(price * count).toLocaleString()}원
                            </span>
                                  </div>
                              )
                          )}
                        </div>
                      </div>
                  )}

                  {/* 총 금액 */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      총 결제금액
                    </span>
                      <span className="text-2xl font-bold text-orange-500">
                      {totalPrice.toLocaleString()}원
                    </span>
                    </div>
                  </div>

                  {/* 결제 버튼 */}
                  <button
                      onClick={handlePayment}
                      disabled={selectedSeats.length === 0 || isProcessing}
                      className={cn(
                          "w-full py-4 rounded-xl font-semibold text-lg transition-all",
                          selectedSeats.length > 0 && !isProcessing
                              ? "bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-lg shadow-orange-500/25"
                              : "bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                      )}
                  >
                    {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      처리 중...
                    </span>
                    ) : (
                        `결제하기 (${selectedSeats.length}석)`
                    )}
                  </button>

                  <p className="mt-4 text-xs text-gray-400 text-center">
                    결제 완료 시 예매가 확정됩니다.
                    <br />
                    취소는 공연 {product.cancelDeadlineDays}일 전까지 가능합니다.
                  </p>
                </div>
              </div>
            </div>
          </main>

          {/* Fallback 결제 모달 */}
          {showFallbackModal && pendingPayment && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    결제 진행
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    결제창이 차단되었거나 응답이 없습니다.
                    <br />
                    아래 버튼을 눌러 결제를 진행해주세요.
                  </p>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">주문번호</span>
                      <span className="text-gray-900 dark:text-white font-mono text-xs">
                    {pendingPayment.orderId}
                  </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">결제금액</span>
                      <span className="text-orange-500 font-semibold">
                    {pendingPayment.amount.toLocaleString()}원
                  </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                        onClick={() => {
                          setShowFallbackModal(false);
                          setPendingPayment(null);
                        }}
                        className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      취소
                    </button>
                    <button
                        onClick={handleFallbackPayment}
                        disabled={!tossLoaded}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-medium hover:from-orange-600 hover:to-rose-600 disabled:opacity-50"
                    >
                      결제하기
                    </button>
                  </div>
                </div>
              </div>
          )}
        </div>
      </>
  );
}