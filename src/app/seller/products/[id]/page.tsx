"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ProductResponse,
  ProductStatus,
  PRODUCT_STATUS_LABELS,
  PRODUCT_TYPE_LABELS,
  AGE_RATING_LABELS,
  getStatusColor,
  getProductTypeColor,
} from "@/types/product";
import { cn } from "@/lib/utils";
import SeatGrid, { StageSeatInfo, ReservationSeatInfo } from "@/components/common/SeatGrid";

interface Props {
  params: Promise<{ id: string }>;
}

export default function SellerProductDetailPage({ params }: Props) {
  const router = useRouter();
  const { id } = use(params);
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [stageSeats, setStageSeats] = useState<StageSeatInfo[]>([]);
  const [reservationSeats, setReservationSeats] = useState<ReservationSeatInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSeatMap, setShowSeatMap] = useState(false);

  // 상품 상세 조회
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data.data || data);
        } else {
          setError("상품을 찾을 수 없습니다.");
        }
      } catch (err) {
        setError("상품 조회에 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // 스테이지 좌석 배치 + 예약 좌석 현황 동시 조회 (stageId가 있을 때)
  useEffect(() => {
    if (!product?.stageId) return;

    const fetchSeatsData = async () => {
      try {
        // 병렬로 두 API 호출
        const [stageResponse, reservationResponse] = await Promise.all([
          fetch(`/api/arthalls/stages/${product.stageId}/stage-seats`),
          fetch(`/api/reservation-seats?productId=${id}`)
        ]);

        if (stageResponse.ok) {
          const stageData = await stageResponse.json();
          const seatList = stageData.data?.content || stageData.data || stageData.content || [];
          setStageSeats(seatList.filter((s: StageSeatInfo) => s.status === "ACTIVE"));
        }

        if (reservationResponse.ok) {
          const reservationData = await reservationResponse.json();
          setReservationSeats(reservationData.data || reservationData.content || []);
        }
      } catch (err) {
        console.error("좌석 데이터 조회 실패:", err);
      }
    };

    fetchSeatsData();
  }, [id, product?.stageId]); // product 전체가 아닌 stageId만 의존

  // 상품 액션 실행
  const executeAction = async (action: string, endpoint: string, method = "POST") => {
    if (!confirm(`${action}하시겠습니까?`)) return;

    setActionLoading(action);
    try {
      const response = await fetch(`/api/products/${id}/${endpoint}`, {
        method,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `${action}에 실패했습니다.`);
      }

      alert(`${action}이 완료되었습니다.`);
      router.refresh();
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : `${action}에 실패했습니다.`);
    } finally {
      setActionLoading(null);
    }
  };

  // 상품 삭제
  const handleDelete = async () => {
    if (!confirm("정말 상품을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.")) return;

    setActionLoading("삭제");
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "삭제에 실패했습니다.");
      }

      alert("상품이 삭제되었습니다.");
      router.push("/seller/products");
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setActionLoading(null);
    }
  };

  // 상태에 따른 액션 버튼
  const getActionButtons = (status: ProductStatus) => {
    const buttons: { label: string; action: string; endpoint: string; color: string }[] = [];

    switch (status) {
      case "DRAFT":
        buttons.push({ label: "심사 요청", action: "심사 요청", endpoint: "submit", color: "bg-blue-500 hover:bg-blue-600" });
        break;
      case "REJECTED":
        buttons.push({ label: "재제출", action: "재제출", endpoint: "resubmit", color: "bg-blue-500 hover:bg-blue-600" });
        break;
      case "APPROVED":
        buttons.push({ label: "예매 예정으로 전환", action: "예매 예정 전환", endpoint: "schedule", color: "bg-purple-500 hover:bg-purple-600" });
        break;
      case "SCHEDULED":
        buttons.push({ label: "판매 시작", action: "판매 시작", endpoint: "start-sale", color: "bg-green-500 hover:bg-green-600" });
        break;
      case "ON_SALE":
        buttons.push({ label: "판매 종료", action: "판매 종료", endpoint: "close-sale", color: "bg-orange-500 hover:bg-orange-600" });
        break;
      case "CLOSED":
        buttons.push({ label: "행사 완료", action: "행사 완료", endpoint: "complete", color: "bg-teal-500 hover:bg-teal-600" });
        break;
    }

    return buttons;
  };

  // 좌석 통계 (reservationSeats 기반)
  const seatStats = {
    total: reservationSeats.length,
    available: reservationSeats.filter((s) => s.status === "AVAILABLE").length,
    preempted: reservationSeats.filter((s) => s.status === "PREEMPTED").length,
    reserved: reservationSeats.filter((s) => s.status === "RESERVED").length,
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  if (error || !product) {
    return (
        <div className="text-center py-12">
          <p className="text-gray-500">{error || "상품을 찾을 수 없습니다."}</p>
          <Link href="/seller/products" className="text-emerald-500 hover:text-emerald-600 mt-4 inline-block">
            ← 목록으로 돌아가기
          </Link>
        </div>
    );
  }

  const actionButtons = getActionButtons(product.status);
  const canEdit = ["DRAFT", "REJECTED"].includes(product.status);
  const canDelete = ["DRAFT", "REJECTED", "CANCELLED"].includes(product.status);

  return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getProductTypeColor(product.productType))}>
              {PRODUCT_TYPE_LABELS[product.productType]}
            </span>
              <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(product.status))}>
              {PRODUCT_STATUS_LABELS[product.status]}
            </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{product.artHallName}</p>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
                <Link
                    href={`/seller/products/${id}/edit`}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  수정
                </Link>
            )}
            {canDelete && (
                <button
                    onClick={handleDelete}
                    disabled={actionLoading === "삭제"}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                >
                  {actionLoading === "삭제" ? "삭제 중..." : "삭제"}
                </button>
            )}
            {actionButtons.map((btn) => (
                <button
                    key={btn.endpoint}
                    onClick={() => executeAction(btn.action, btn.endpoint)}
                    disabled={actionLoading === btn.action}
                    className={cn("px-4 py-2 text-white rounded-lg disabled:opacity-50", btn.color)}
                >
                  {actionLoading === btn.action ? "처리 중..." : btn.label}
                </button>
            ))}
          </div>
        </div>

        {/* 반려 사유 */}
        {product.status === "REJECTED" && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">반려 사유</h3>
              <p className="text-sm text-red-600 dark:text-red-400">
                {product.rejectionReason || "상품 정보가 불완전하거나 정책에 부합하지 않습니다."}
              </p>
            </div>
        )}

        {/* 좌석 배치도 (펼치기/접기) */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <button
              onClick={() => setShowSeatMap(!showSeatMap)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">좌석 배치도</h2>
              <span className="text-sm text-gray-500">
              총 {seatStats.total}석 |
              <span className="text-green-600 ml-1">가능 {seatStats.available}</span>
                {seatStats.preempted > 0 && <span className="text-yellow-600 ml-1">선점 {seatStats.preempted}</span>}
                {seatStats.reserved > 0 && <span className="text-blue-600 ml-1">예약 {seatStats.reserved}</span>}
            </span>
            </div>
            <svg
                className={cn("w-5 h-5 text-gray-500 transition-transform", showSeatMap && "rotate-180")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showSeatMap && (
              <div className="px-6 pb-6">
                <SeatGrid
                    mode="view"
                    stageSeats={stageSeats}
                    reservationSeats={reservationSeats}
                />
              </div>
          )}
        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 좌측: 상품 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 기본 정보 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">기본 정보</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">공연 기간</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {new Date(product.startAt).toLocaleDateString("ko-KR")} ~ {new Date(product.endAt).toLocaleDateString("ko-KR")}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">판매 기간</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {new Date(product.saleStartAt).toLocaleDateString("ko-KR")} ~ {new Date(product.saleEndAt).toLocaleDateString("ko-KR")}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">러닝타임</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">{product.runningTime}분</dd>
                </div>
                <div>
                  <dt className="text-gray-500">관람등급</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">{AGE_RATING_LABELS[product.ageRating]}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">공연장</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">{product.artHallName}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">스테이지</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">{product.stageName}</dd>
                </div>
              </div>
            </div>

            {/* 좌석 등급별 현황 */}
            {product.seatGrades && product.seatGrades.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">좌석 등급별 현황</h2>
                  <div className="space-y-3">
                    {product.seatGrades.map((grade, index) => {
                      const percentage = grade.totalSeats > 0
                          ? ((grade.totalSeats - grade.availableSeats) / grade.totalSeats) * 100
                          : 0;
                      return (
                          <div key={index} className="flex items-center gap-4">
                            <div className="w-16 font-medium text-gray-900 dark:text-white">{grade.gradeName}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">
                            {grade.availableSeats} / {grade.totalSeats}석
                          </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                            {grade.price.toLocaleString()}원
                          </span>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                      );
                    })}
                  </div>
                </div>
            )}

            {/* 상세 설명 */}
            {product.description && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">상세 설명</h2>
                  <div
                      className="prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
            )}

            {/* 정책 정보 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">정책 정보</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                <span className={product.idVerificationRequired ? "text-green-500" : "text-gray-400"}>
                  {product.idVerificationRequired ? "✓" : "✗"}
                </span>
                  <span className="text-gray-700 dark:text-gray-300">본인확인 필수</span>
                </div>
                <div className="flex items-center gap-2">
                <span className={product.transferable ? "text-green-500" : "text-gray-400"}>
                  {product.transferable ? "✓" : "✗"}
                </span>
                  <span className="text-gray-700 dark:text-gray-300">양도 가능</span>
                </div>
                <div className="flex items-center gap-2">
                <span className={product.lateEntryAllowed ? "text-green-500" : "text-gray-400"}>
                  {product.lateEntryAllowed ? "✓" : "✗"}
                </span>
                  <span className="text-gray-700 dark:text-gray-300">지각입장 가능</span>
                </div>
                <div className="flex items-center gap-2">
                <span className={product.photographyAllowed ? "text-green-500" : "text-gray-400"}>
                  {product.photographyAllowed ? "✓" : "✗"}
                </span>
                  <span className="text-gray-700 dark:text-gray-300">촬영 허용</span>
                </div>
                <div className="flex items-center gap-2">
                <span className={product.cancellable ? "text-green-500" : "text-gray-400"}>
                  {product.cancellable ? "✓" : "✗"}
                </span>
                  <span className="text-gray-700 dark:text-gray-300">취소/환불 가능</span>
                </div>
                {product.cancellable && (
                    <div>
                  <span className="text-gray-700 dark:text-gray-300">
                    취소 마감: 공연 {product.cancelDeadlineDays}일 전
                  </span>
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* 우측: 포스터 & 통계 */}
          <div className="space-y-6">
            {/* 포스터 */}
            {product.posterImageUrl && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                    <Image
                        src={product.posterImageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                  </div>
                </div>
            )}

            {/* 판매 현황 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">판매 현황</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">전체</span>
                  <span className="font-bold text-gray-900 dark:text-white">{seatStats.total}석</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">예매 가능</span>
                  </div>
                  <span className="font-medium text-green-600">{seatStats.available}석</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-gray-600 dark:text-gray-400">선점 중</span>
                  </div>
                  <span className="font-medium text-yellow-600">{seatStats.preempted}석</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-gray-600 dark:text-gray-400">예약 완료</span>
                  </div>
                  <span className="font-medium text-blue-600">{seatStats.reserved}석</span>
                </div>

                {/* 판매율 */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500">판매율</span>
                    <span className="font-bold text-emerald-600">
                    {seatStats.total > 0
                        ? Math.round((seatStats.reserved / seatStats.total) * 100)
                        : 0}%
                  </span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{
                          width: `${seatStats.total > 0 ? (seatStats.reserved / seatStats.total) * 100 : 0}%`,
                        }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 조회수/등록일 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">통계</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">조회수</span>
                  <span className="font-medium text-gray-900 dark:text-white">{product.viewCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">등록일</span>
                  <span className="text-gray-900 dark:text-white">
                  {new Date(product.createdAt).toLocaleDateString("ko-KR")}
                </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">수정일</span>
                  <span className="text-gray-900 dark:text-white">
                  {new Date(product.updatedAt).toLocaleDateString("ko-KR")}
                </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 네비게이션 */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
          <Link
              href="/seller/products"
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← 목록으로 돌아가기
          </Link>
        </div>
      </div>
  );
}