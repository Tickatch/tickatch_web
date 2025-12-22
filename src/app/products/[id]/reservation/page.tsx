// app/products/[id]/reservation/page.tsx
"use client";

import { useState, useEffect, useCallback, use, Suspense, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/common/Header";
import SeatGrid, { StageSeatInfo, ReservationSeatInfo, SelectableSeatInfo } from "@/components/common/SeatGrid";
import PaymentFailModal from "@/components/payment/PaymentFailModal";
import { ProductResponse } from "@/types/product";
import { CreateReservationRequest, ReservationResponse } from "@/types/reservation";
import { CreatePaymentRequest, PaymentItem } from "@/types/payment";
import { useAuth } from "@/hooks/useAuth";
import { usePaymentPopup } from "@/hooks/usePaymentPopup";
import { cn } from "@/lib/utils";

/**
 * 예약 페이지
 * - SSE 연결 없이 API로 입장 권한 검증
 * - 이탈/새로고침 시 allowed-in-token 삭제
 * - 예매 완료 시 allowed-in-token 삭제
 */

const GRADE_COLOR_PALETTE = [
  { bg: "bg-purple-500" },
  { bg: "bg-amber-500" },
  { bg: "bg-blue-500" },
  { bg: "bg-emerald-500" },
  { bg: "bg-rose-500" },
  { bg: "bg-cyan-500" },
  { bg: "bg-indigo-500" },
  { bg: "bg-orange-500" },
];

interface Props {
  params: Promise<{ id: string }>;
}

function ReservationContent({ productId }: { productId: string }) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user, userType } = useAuth();

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [stageSeats, setStageSeats] = useState<StageSeatInfo[]>([]);
  const [reservationSeats, setReservationSeats] = useState<ReservationSeatInfo[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<SelectableSeatInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"select" | "payment">("select");
  const [createdReservations, setCreatedReservations] = useState<ReservationResponse[]>([]);

  // 대기열 검증 상태 (SSE 제거, API만 사용)
  const [isQueueVerified, setIsQueueVerified] = useState(false);
  const [isQueueChecking, setIsQueueChecking] = useState(true);

  // 결제 실패 모달 상태
  const [showFailModal, setShowFailModal] = useState(false);
  const [failMessage, setFailMessage] = useState("");

  // 결제 완료 여부 추적 (이탈 시 토큰 삭제 방지용)
  const isPaymentCompletedRef = useRef(false);
  const isQueueVerifiedRef = useRef(false);

  // isQueueVerified 변경 시 ref 업데이트
  useEffect(() => {
    isQueueVerifiedRef.current = isQueueVerified;
  }, [isQueueVerified]);

  // 페이지 이탈 시 입장 토큰 삭제 (결제 완료 시 제외)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 결제 완료가 아니고, 입장 권한이 있었던 경우에만 삭제
      if (!isPaymentCompletedRef.current && isQueueVerifiedRef.current) {
        navigator.sendBeacon("/api/queue/leave/allowed-in");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // 컴포넌트 언마운트 시 (다른 페이지로 이동)
      if (!isPaymentCompletedRef.current && isQueueVerifiedRef.current) {
        fetch("/api/queue/leave/allowed-in", {
          method: "POST",
          credentials: "include",
        });
      }
    };
  }, []);

  // 입장 토큰 삭제 (예매 완료 시 호출)
  const removeAllowedInToken = useCallback(async () => {
    try {
      await fetch("/api/queue/leave/allowed-in", {
        method: "POST",
        credentials: "include",
      });
      console.log("[ReservationPage] 입장 토큰 삭제 완료");
    } catch (error) {
      console.error("[ReservationPage] 입장 토큰 삭제 실패:", error);
    }
  }, []);

  // 결제 성공 핸들러
  const handlePaymentSuccess = useCallback(async (data: { paymentKey: string; orderId: string; amount: number }) => {
    setIsProcessing(true);
    try {
      const response = await fetch(
          `/api/payments/resp/success?paymentKey=${data.paymentKey}&orderId=${data.orderId}&amount=${data.amount}`
      );
      const result = await response.json();

      if (result.success) {
        // 결제 완료 표시 (이탈 시 토큰 삭제 방지)
        isPaymentCompletedRef.current = true;
        // 예매 완료 시 입장 토큰 삭제
        await removeAllowedInToken();
        alert("예매가 완료되었습니다!");
        router.push("/mypage/reservations");
      } else {
        setFailMessage(result.error?.message || "결제 확정에 실패했습니다.");
        setShowFailModal(true);
      }
    } catch (error) {
      console.error("Payment success callback error:", error);
      setFailMessage("결제 확정 중 오류가 발생했습니다.");
      setShowFailModal(true);
    } finally {
      setIsProcessing(false);
    }
  }, [router, removeAllowedInToken]);

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

    setFailMessage(data.message || "결제가 취소되었습니다.");
    setShowFailModal(true);
    setIsProcessing(false);
  }, []);

  // 결제 취소 핸들러
  const handlePaymentCancel = useCallback(() => {
    setFailMessage("결제를 취소하셨습니다.");
    setShowFailModal(true);
    setIsProcessing(false);
  }, []);

  // 결제 팝업 훅
  const { openPaymentPopup } = usePaymentPopup({
    onSuccess: (data) => {
      console.log("[ReservationPage] onSuccess 호출됨:", data);
      handlePaymentSuccess(data);
    },
    onFail: (data) => {
      console.log("[ReservationPage] onFail 호출됨:", data);
      handlePaymentFail(data);
    },
    onCancel: () => {
      console.log("[ReservationPage] onCancel 호출됨");
      handlePaymentCancel();
    },
  });

  // 인증 체크
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/products/${productId}/reservation`);
    }
  }, [authLoading, isAuthenticated, productId, router]);

  // ✅ 대기열 검증 - API로만 확인 (SSE 없음)
  useEffect(() => {
    const verifyQueueAccess = async () => {
      if (!isAuthenticated || authLoading) return;

      setIsQueueChecking(true);

      try {
        const response = await fetch("/api/queue/status", {
          method: "GET",
          credentials: "include",
        });

        const result = await response.json();

        // 입장 가능 확인 (message가 "입장 가능합니다."이고 data가 null)
        if (result.success && result.message === "입장 가능합니다." && !result.data) {
          console.log("[ReservationPage] 입장 권한 확인됨");
          setIsQueueVerified(true);
        } else {
          // 입장 불가 - 상품 페이지로 리다이렉트
          console.log("[ReservationPage] 입장 권한 없음, 리다이렉트");
          router.push(`/products/${productId}`);
        }
      } catch (error) {
        console.error("[ReservationPage] Queue verification error:", error);
        router.push(`/products/${productId}`);
      } finally {
        setIsQueueChecking(false);
      }
    };

    verifyQueueAccess();
  }, [isAuthenticated, authLoading, productId, router]);

  // 데이터 로드 - 대기열 검증 후에만 실행
  useEffect(() => {
    const fetchData = async () => {
      if (isQueueChecking || !isQueueVerified) return;

      setIsLoading(true);
      setError(null);

      try {
        // 1. 상품 정보
        const productRes = await fetch(`/api/products/${productId}`);
        const productResult = await productRes.json();

        let productData: ProductResponse | null = null;
        if (productResult.success && productResult.data) {
          productData = productResult.data;
        } else if (productResult.data) {
          productData = productResult.data;
        } else if (productResult.id) {
          productData = productResult;
        }

        if (!productData) {
          setError("상품을 찾을 수 없습니다.");
          setIsLoading(false);
          return;
        }
        setProduct(productData);

        // 2. 스테이지 좌석 조회
        let stageSeatData: StageSeatInfo[] = [];
        if (productData.stageId) {
          const stageRes = await fetch(`/api/arthalls/stages/${productData.stageId}/stage-seats`);
          const stageResult = await stageRes.json();

          if (stageResult.success && stageResult.data?.content) {
            stageSeatData = stageResult.data.content;
          } else if (stageResult.data?.content) {
            stageSeatData = stageResult.data.content;
          } else if (Array.isArray(stageResult.data)) {
            stageSeatData = stageResult.data;
          } else if (stageResult.content) {
            stageSeatData = stageResult.content;
          }
          stageSeatData = stageSeatData.filter((s) => s.status === "ACTIVE");
        }

        if (stageSeatData.length === 0) {
          setError("좌석 정보를 불러올 수 없습니다.");
          setIsLoading(false);
          return;
        }
        setStageSeats(stageSeatData);

        // 3. 예약 좌석 조회
        let reservationSeatData: ReservationSeatInfo[] = [];
        const reservationRes = await fetch(`/api/reservation-seats?productId=${productId}`);
        const reservationResult = await reservationRes.json();

        if (reservationResult.success && reservationResult.data) {
          reservationSeatData = Array.isArray(reservationResult.data)
              ? reservationResult.data
              : reservationResult.data.content || [];
        } else if (Array.isArray(reservationResult.data)) {
          reservationSeatData = reservationResult.data;
        } else if (reservationResult.content) {
          reservationSeatData = reservationResult.content;
        }
        setReservationSeats(reservationSeatData);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("데이터를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    if (productId && !authLoading && isAuthenticated) {
      fetchData();
    }
  }, [productId, authLoading, isAuthenticated, isQueueChecking, isQueueVerified]);

  // 좌석 선택/해제
  const handleSeatSelect = useCallback((seat: SelectableSeatInfo) => {
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
  }, [selectedSeats, product?.maxTicketsPerPerson]);

  // 총 금액
  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  // 등급별 요약
  const gradesSummary = selectedSeats.reduce((acc, seat) => {
    if (!acc[seat.grade]) acc[seat.grade] = { count: 0, price: seat.price };
    acc[seat.grade].count++;
    return acc;
  }, {} as Record<string, { count: number; price: number }>);

  // 등급 색상 매핑
  const gradeNames = [...new Set(reservationSeats.map(s => s.grade))];
  const gradeColorMap = new Map<string, string>();
  gradeNames.forEach((grade, index) => {
    gradeColorMap.set(grade, GRADE_COLOR_PALETTE[index % GRADE_COLOR_PALETTE.length].bg);
  });

  // 1단계: 예약 생성
  const handleCreateReservations = async () => {
    if (selectedSeats.length === 0) {
      alert("좌석을 선택해주세요.");
      return;
    }

    if (!user?.id || !product) {
      alert("사용자 정보를 확인할 수 없습니다.");
      return;
    }

    setIsProcessing(true);

    try {
      const reservations: ReservationResponse[] = [];

      for (const seat of selectedSeats) {
        const reservationRequest: CreateReservationRequest = {
          reserverId: user.id,
          reserverName: user.nickname || user.email?.split("@")[0] || "고객",
          productId: Number(productId),
          productName: product.name,
          seatId: seat.id,
          seatNumber: seat.seatNumber,
          price: seat.price,
        };

        const response = await fetch("/api/reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reservationRequest),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error?.message || "예약 생성에 실패했습니다.");
        }

        reservations.push(result.data);
      }

      setCreatedReservations(reservations);
      setStep("payment");
    } catch (error) {
      console.error("Reservation create error:", error);
      alert(error instanceof Error ? error.message : "예약 생성 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 2단계: 결제 진행 (팝업 방식)
  const handlePayment = async () => {
    if (createdReservations.length === 0) {
      alert("예약 정보가 없습니다.");
      return;
    }

    setIsProcessing(true);

    try {
      const paymentItems: PaymentItem[] = createdReservations.map((r) => ({
        reservationId: r.id,
        price: r.price || 0,
      }));

      const paymentRequest: CreatePaymentRequest = {
        orderName: product?.name || "공연 예매",
        payments: paymentItems,
      };

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentRequest),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || "결제 생성에 실패했습니다.");
      }

      const checkoutUrl = result.data.checkoutUrl;

      if (!checkoutUrl) {
        setFailMessage("결제 URL을 받지 못했습니다. 다시 시도해 주세요.");
        setShowFailModal(true);
        setIsProcessing(false);
        return;
      }

      openPaymentPopup(checkoutUrl);

    } catch (error) {
      console.error("Payment error:", error);
      setFailMessage(error instanceof Error ? error.message : "결제 요청 중 오류가 발생했습니다.");
      setShowFailModal(true);
      setIsProcessing(false);
    }
  };

  // 다시 결제하기
  const handleRetryPayment = () => {
    handlePayment();
  };

  // 대기열 검증 중 또는 로딩 중
  if (authLoading || isQueueChecking) {
    return (
        <>
          <Header userType={userType || "CUSTOMER"} />
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              {isQueueChecking ? "접근 권한 확인 중..." : "로딩 중..."}
            </p>
          </div>
        </>
    );
  }

  // 대기열 검증 실패 (이미 리다이렉트 되지만, fallback으로)
  if (!isQueueVerified) {
    return (
        <>
          <Header userType={userType || "CUSTOMER"} />
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              대기열을 통해 접근해주세요.
            </p>
            <button
                onClick={() => router.push(`/products/${productId}`)}
                className="text-orange-500 hover:underline"
            >
              상품 페이지로 이동
            </button>
          </div>
        </>
    );
  }

  // 데이터 로딩 중
  if (isLoading) {
    return (
        <>
          <Header userType={userType || "CUSTOMER"} />
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </>
    );
  }

  // 에러
  if (error || !product) {
    return (
        <>
          <Header userType={userType || "CUSTOMER"} />
          <div className="min-h-screen flex flex-col items-center justify-center">
            <p className="text-gray-500 mb-4">{error || "상품을 찾을 수 없습니다."}</p>
            <button onClick={() => router.back()} className="text-orange-500 hover:underline">돌아가기</button>
          </div>
        </>
    );
  }

  return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <Header userType={userType || "CUSTOMER"} />

          <main className="pt-16">
            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
              {/* 좌석 배치도 */}
              <div className="flex-1 p-4 lg:p-6 overflow-auto">
                {step === "select" && (
                    <SeatGrid
                        mode="reservation"
                        stageSeats={stageSeats}
                        reservationSeats={reservationSeats}
                        selectedSeatIds={new Set(selectedSeats.map((s) => s.id))}
                        maxSeats={product.maxTicketsPerPerson || 4}
                        onSeatSelect={handleSeatSelect}
                    />
                )}

                {step === "payment" && (
                    <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">결제 확인</h2>

                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">예매 건수</span>
                          <span className="text-gray-900 dark:text-white">{createdReservations.length}건</span>
                        </div>
                        {createdReservations.map((r, index) => (
                            <div key={r.id} className="flex justify-between text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">
                          좌석 {index + 1}: {selectedSeats[index]?.seatNumber}
                        </span>
                              <span className="text-gray-900 dark:text-white">
                          {(r.price || 0).toLocaleString()}원
                        </span>
                            </div>
                        ))}
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">총 결제금액</span>
                          <span className="text-2xl font-bold text-orange-500">{totalPrice.toLocaleString()}원</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                            onClick={() => setStep("select")}
                            disabled={isProcessing}
                            className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                        >
                          뒤로
                        </button>
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-medium hover:from-orange-600 hover:to-rose-600 disabled:opacity-50"
                        >
                          {isProcessing ? (
                              <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          처리 중...
                        </span>
                          ) : (
                              "결제하기"
                          )}
                        </button>
                      </div>
                    </div>
                )}
              </div>

              {/* 사이드바 */}
              <div className="lg:w-[380px] bg-white dark:bg-gray-900 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800">
                <div className="sticky top-16 p-4 lg:p-6">
                  {/* 공연 정보 */}
                  <div className="flex gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="w-20 h-28 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                      <Image
                          src={product.posterImageUrl || `https://picsum.photos/seed/p${product.id}/200/280`}
                          alt={product.name}
                          width={80}
                          height={112}
                          className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">{product.name}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{product.artHallName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">최대 {product.maxTicketsPerPerson}매 선택 가능</p>
                    </div>
                  </div>

                  {/* 선택 좌석 */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      선택 좌석 ({selectedSeats.length}/{product.maxTicketsPerPerson})
                    </h3>
                    {selectedSeats.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">좌석을 선택해주세요</p>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-auto">
                          {selectedSeats.map((seat) => {
                            const bgColor = gradeColorMap.get(seat.grade) || "bg-gray-500";
                            return (
                                <div key={seat.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                                  <div className="flex items-center gap-3">
                                    <span className={cn("px-2 py-0.5 rounded text-xs font-medium text-white", bgColor)}>{seat.grade}</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{seat.seatNumber}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{seat.price.toLocaleString()}원</span>
                                    {step === "select" && (
                                        <button onClick={() => handleSeatSelect(seat)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                    )}
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
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">등급별 선택 현황</h4>
                        <div className="space-y-1">
                          {Object.entries(gradesSummary).map(([grade, { count, price }]) => (
                              <div key={grade} className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">{grade} x {count}</span>
                                <span className="text-gray-900 dark:text-white">{(price * count).toLocaleString()}원</span>
                              </div>
                          ))}
                        </div>
                      </div>
                  )}

                  {/* 총 금액 */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">총 결제금액</span>
                      <span className="text-2xl font-bold text-orange-500">{totalPrice.toLocaleString()}원</span>
                    </div>
                  </div>

                  {/* 버튼 */}
                  {step === "select" && (
                      <button
                          onClick={handleCreateReservations}
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
                            `예매하기 (${selectedSeats.length}석)`
                        )}
                      </button>
                  )}

                  <p className="mt-4 text-xs text-gray-400 text-center">
                    결제 완료 시 예매가 확정됩니다.<br />
                    취소는 공연 {product.cancelDeadlineDays}일 전까지 가능합니다.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* 결제 실패 모달 */}
        <PaymentFailModal
            isOpen={showFailModal}
            onClose={() => setShowFailModal(false)}
            onRetry={handleRetryPayment}
            errorMessage={failMessage}
        />
      </>
  );
}

export default function ReservationPage({ params }: Props) {
  const { id: productId } = use(params);

  return (
      <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }
      >
        <ReservationContent productId={productId} />
      </Suspense>
  );
}