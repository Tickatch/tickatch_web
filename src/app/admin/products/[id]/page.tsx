"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ProductResponse,
  PRODUCT_STATUS_LABELS,
  PRODUCT_TYPE_LABELS,
  AGE_RATING_LABELS,
  getStatusColor,
  getProductTypeColor,
} from "@/types/product";
import { SellerResponse } from "@/types/user";
import {
  ReservationSeatResponse,
  RESERVATION_SEAT_STATUS_LABELS,
  getReservationSeatStatusColor,
  getGradeBgColor,
} from "@/types/reservation-seat";
import { ApiResponse } from "@/types/api";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default function AdminProductDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [seller, setSeller] = useState<SellerResponse | null>(null);
  const [seats, setSeats] = useState<ReservationSeatResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 반려 모달
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // 좌석 탭
  const [seatTab, setSeatTab] = useState<"ALL" | "AVAILABLE" | "RESERVED">("ALL");

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. 상품 조회
        const productRes = await fetch(`/api/products/${id}`);
        const productData: ApiResponse<ProductResponse> = await productRes.json();

        if (!productRes.ok || !productData.success) {
          throw new Error(productData.error?.message || "상품 조회에 실패했습니다.");
        }

        const productInfo = productData.data!;
        setProduct(productInfo);

        // 2. 판매자 조회
        try {
          const sellerRes = await fetch(`/api/user/sellers/${productInfo.sellerId}`);
          const sellerData: ApiResponse<SellerResponse> = await sellerRes.json();
          if (sellerRes.ok && sellerData.success) {
            setSeller(sellerData.data || null);
          }
        } catch {
          // 판매자 조회 실패는 무시
        }

        // 3. 좌석 조회 (판매중, 판매종료, 행사종료 상태일 때)
        if (["ON_SALE", "CLOSED", "COMPLETED", "SCHEDULED"].includes(productInfo.status)) {
          try {
            const seatsRes = await fetch(`/api/reservation-seats?productId=${id}`);
            const seatsData: ApiResponse<ReservationSeatResponse[]> = await seatsRes.json();
            if (seatsRes.ok && seatsData.success) {
              setSeats(seatsData.data || []);
            }
          } catch {
            // 좌석 조회 실패는 무시
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "데이터 조회에 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 상품 승인
  const handleApprove = async () => {
    const confirmed = confirm("이 상품을 승인하시겠습니까?");
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/products/${id}/approve`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "승인에 실패했습니다.");
      }

      alert("상품이 승인되었습니다.");
      router.push("/admin/products/pending");
    } catch (err) {
      alert(err instanceof Error ? err.message : "승인에 실패했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 상품 반려
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("반려 사유를 입력해주세요.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/products/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "반려에 실패했습니다.");
      }

      alert("상품이 반려되었습니다.");
      router.push("/admin/products/pending");
    } catch (err) {
      alert(err instanceof Error ? err.message : "반려에 실패했습니다.");
    } finally {
      setIsProcessing(false);
      setShowRejectModal(false);
    }
  };

  // 좌석 필터링
  const filteredSeats = seats.filter((seat) => {
    if (seatTab === "ALL") return true;
    if (seatTab === "AVAILABLE") return seat.status === "AVAILABLE";
    if (seatTab === "RESERVED") return ["RESERVED", "PREEMPTED"].includes(seat.status);
    return true;
  });

  // 좌석 통계
  const seatStats = {
    total: seats.length,
    available: seats.filter((s) => s.status === "AVAILABLE").length,
    reserved: seats.filter((s) => s.status === "RESERVED").length,
    preempted: seats.filter((s) => s.status === "PREEMPTED").length,
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  if (error || !product) {
    return (
        <div className="p-6">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error || "상품을 찾을 수 없습니다."}</p>
          </div>
          <Link href="/admin/products" className="mt-4 inline-block text-purple-500 hover:underline">
            ← 목록으로 돌아가기
          </Link>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div>
            <Link href="/admin/products" className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-2 inline-block">
              ← 상품 목록
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getProductTypeColor(product.productType))}>
              {PRODUCT_TYPE_LABELS[product.productType]}
            </span>
              <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(product.status))}>
              {PRODUCT_STATUS_LABELS[product.status]}
            </span>
            </div>
          </div>

          {/* 심사 버튼 */}
          {product.status === "PENDING" && (
              <div className="flex gap-2">
                <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  승인
                </button>
                <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  반려
                </button>
              </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 상품 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 기본 정보 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">기본 정보</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">공연장</p>
                  <p className="font-medium">{product.artHallName}</p>
                  <p className="text-xs text-gray-400">{product.artHallAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">무대</p>
                  <p className="font-medium">{product.stageName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">공연 기간</p>
                  <p className="font-medium">
                    {new Date(product.startAt).toLocaleDateString("ko-KR")} ~ {new Date(product.endAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">러닝타임</p>
                  <p className="font-medium">{product.runningTime}분</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">판매 기간</p>
                  <p className="font-medium">
                    {new Date(product.saleStartAt).toLocaleDateString("ko-KR")} ~ {new Date(product.saleEndAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">관람 등급</p>
                  <p className="font-medium">{AGE_RATING_LABELS[product.ageRating]}</p>
                </div>
              </div>
            </div>

            {/* 예매 정책 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">예매 정책</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", product.idVerificationRequired ? "bg-green-500" : "bg-gray-300")} />
                  <span className="text-sm">본인 확인</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", product.transferable ? "bg-green-500" : "bg-gray-300")} />
                  <span className="text-sm">양도 가능</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", product.cancellable ? "bg-green-500" : "bg-gray-300")} />
                  <span className="text-sm">취소 가능</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", product.lateEntryAllowed ? "bg-green-500" : "bg-gray-300")} />
                  <span className="text-sm">늦은 입장</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", product.photographyAllowed ? "bg-green-500" : "bg-gray-300")} />
                  <span className="text-sm">촬영 가능</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", product.foodAllowed ? "bg-green-500" : "bg-gray-300")} />
                  <span className="text-sm">음식 반입</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">1인당 최대 예매:</span>
                    <span className="ml-2 font-medium">{product.maxTicketsPerPerson}매</span>
                  </div>
                  <div>
                    <span className="text-gray-500">입장 시작:</span>
                    <span className="ml-2 font-medium">공연 {product.admissionMinutesBefore}분 전</span>
                  </div>
                  {product.cancellable && (
                      <div>
                        <span className="text-gray-500">취소 마감:</span>
                        <span className="ml-2 font-medium">공연 {product.cancelDeadlineDays}일 전</span>
                      </div>
                  )}
                  {product.hasIntermission && (
                      <div>
                        <span className="text-gray-500">인터미션:</span>
                        <span className="ml-2 font-medium">{product.intermissionMinutes}분</span>
                      </div>
                  )}
                </div>
              </div>
            </div>

            {/* 좌석 현황 */}
            {seats.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">좌석 현황</h2>

                  {/* 좌석 통계 */}
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{seatStats.total}</p>
                      <p className="text-xs text-gray-500">전체</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{seatStats.available}</p>
                      <p className="text-xs text-gray-500">예매 가능</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{seatStats.reserved}</p>
                      <p className="text-xs text-gray-500">예약 완료</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{seatStats.preempted}</p>
                      <p className="text-xs text-gray-500">선점 중</p>
                    </div>
                  </div>

                  {/* 좌석 탭 */}
                  <div className="flex gap-2 mb-4">
                    {[
                      { value: "ALL", label: `전체 (${seatStats.total})` },
                      { value: "AVAILABLE", label: `예매 가능 (${seatStats.available})` },
                      { value: "RESERVED", label: `예약됨 (${seatStats.reserved + seatStats.preempted})` },
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setSeatTab(tab.value as typeof seatTab)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                seatTab === tab.value
                                    ? "bg-purple-500 text-white"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                            )}
                        >
                          {tab.label}
                        </button>
                    ))}
                  </div>

                  {/* 좌석 목록 */}
                  <div className="max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {filteredSeats.slice(0, 100).map((seat) => (
                          <div
                              key={seat.id}
                              className={cn(
                                  "p-2 rounded text-center text-xs border",
                                  seat.status === "AVAILABLE"
                                      ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                                      : seat.status === "RESERVED"
                                          ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                                          : seat.status === "PREEMPTED"
                                              ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
                                              : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                              )}
                          >
                            <div className="font-medium">{seat.seatNumber}</div>
                            <div className={cn("text-[10px]", getGradeBgColor(seat.grade).replace("bg-", "text-"))}>{seat.grade}</div>
                          </div>
                      ))}
                    </div>
                    {filteredSeats.length > 100 && (
                        <p className="text-center text-sm text-gray-500 mt-2">
                          외 {filteredSeats.length - 100}개 좌석...
                        </p>
                    )}
                  </div>
                </div>
            )}

            {/* 좌석 등급 정보 */}
            {product.seatGrades && product.seatGrades.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">좌석 등급</h2>
                  <div className="space-y-2">
                    {product.seatGrades.map((grade, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className={cn("w-3 h-3 rounded-full", getGradeBgColor(grade.gradeName))} />
                            <span className="font-medium">{grade.gradeName}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{grade.price.toLocaleString()}원</p>
                            <p className="text-xs text-gray-500">
                              {grade.availableSeats} / {grade.totalSeats}석
                            </p>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 판매자 정보 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">판매자 정보</h2>
              {seller ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">상호명</p>
                      <p className="font-medium">{seller.businessName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">담당자</p>
                      <p className="font-medium">{seller.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">대표자</p>
                      <p className="font-medium">{seller.representativeName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">사업자등록번호</p>
                      <p className="font-medium font-mono">{seller.formattedBusinessNumber}</p>
                    </div>
                    {seller.phone && (
                        <div>
                          <p className="text-sm text-gray-500">연락처</p>
                          <p className="font-medium">{seller.phone}</p>
                        </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">이메일</p>
                      <p className="font-medium text-sm">{seller.email}</p>
                    </div>
                    <Link
                        href={`/admin/users/sellers?email=${seller.email}`}
                        className="block mt-4 text-center text-sm text-purple-500 hover:text-purple-600"
                    >
                      판매자 상세보기 →
                    </Link>
                  </div>
              ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">판매자 정보를 불러올 수 없습니다.</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">{product.sellerId}</p>
                  </div>
              )}
            </div>

            {/* 메타 정보 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">메타 정보</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">상품 ID</span>
                  <span className="font-mono">{product.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">총 좌석</span>
                  <span>{product.totalSeats.toLocaleString()}석</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">잔여 좌석</span>
                  <span>{product.availableSeats.toLocaleString()}석</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">조회수</span>
                  <span>{product.viewCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">등록일</span>
                  <span>{new Date(product.createdAt).toLocaleDateString("ko-KR")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">수정일</span>
                  <span>{new Date(product.updatedAt).toLocaleDateString("ko-KR")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 반려 모달 */}
        {showRejectModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  상품 반려
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span className="font-medium text-gray-900 dark:text-white">
                {product.name}
              </span>
                  을(를) 반려합니다.
                </p>
                <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="반려 사유를 입력해주세요..."
                    rows={4}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button
                      onClick={() => {
                        setShowRejectModal(false);
                        setRejectReason("");
                      }}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    취소
                  </button>
                  <button
                      onClick={handleReject}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? "처리 중..." : "반려하기"}
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}