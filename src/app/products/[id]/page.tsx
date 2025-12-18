"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/common/Header";
import QueueModal from "@/components/queue/QueueModal";
import {
  ProductResponse,
  PRODUCT_TYPE_LABELS,
  PRODUCT_STATUS_LABELS,
  AGE_RATING_LABELS,
  parseDetailImageUrls,
  getMinPrice,
  getMaxPrice,
} from "@/types/product";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: Props) {
  const { id: productId } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "notice" | "review">("info");
  const [isLiked, setIsLiked] = useState(false);

  // 대기열 모달 상태
  const [showQueueModal, setShowQueueModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products/${productId}`);
        const result = await response.json();

        // API 응답 구조: { success: true, data: ProductResponse }
        if (result.success && result.data) {
          setProduct(result.data);
        } else if (result.data) {
          // success 필드 없이 data만 있는 경우
          setProduct(result.data);
        } else if (result.id) {
          // 직접 ProductResponse가 온 경우
          setProduct(result);
        } else {
          setError(result.error?.message || "상품을 찾을 수 없습니다.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("상품을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // 예매하기 버튼 클릭 - 대기열 모달 표시
  const handleReservationClick = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${productId}`);
      return;
    }
    // 대기열 모달 열기
    setShowQueueModal(true);
  };

  // 대기열 통과 시 예매 페이지로 이동
  const handleQueueReady = useCallback(() => {
    // 약간의 딜레이 후 이동 (사용자가 "입장 가능" 메시지를 볼 수 있도록)
    setTimeout(() => {
      setShowQueueModal(false);
      router.push(`/products/${productId}/reservation`);
    }, 1000);
  }, [productId, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ON_SALE":
        return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
      case "SCHEDULED":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
      case "CLOSED":
      case "COMPLETED":
        return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
    }
  };

  // 로딩
  if (isLoading) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <Header userType="CUSTOMER" bannerHeight={0} />
          <div className="pt-16 flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
    );
  }

  // 에러 또는 상품 없음
  if (error || !product) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <Header userType="CUSTOMER" bannerHeight={0} />
          <div className="pt-16 flex flex-col items-center justify-center min-h-[60vh]">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error || "상품을 찾을 수 없습니다"}
            </p>
            <Link href="/products" className="text-orange-500 hover:underline">
              상품 목록으로 돌아가기
            </Link>
          </div>
        </div>
    );
  }

  const detailImages = parseDetailImageUrls(product.detailImageUrls);
  const minPrice = getMinPrice(product.seatGrades);
  const maxPrice = getMaxPrice(product.seatGrades);

  return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <Header userType="CUSTOMER" bannerHeight={0} />

          <main className="pt-16">
            {/* 상품 기본 정보 */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="max-w-[1400px] mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* 포스터 */}
                  <div className="lg:w-[300px] flex-shrink-0">
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800">
                      <Image
                          src={
                              product.posterImageUrl ||
                              `https://picsum.photos/seed/p${product.id}/300/400`
                          }
                          alt={product.name}
                          fill
                          className="object-cover"
                          priority
                      />
                    </div>
                  </div>

                  {/* 정보 */}
                  <div className="flex-1">
                    {/* 카테고리 & 상태 */}
                    <div className="flex items-center gap-2 mb-3">
                      <Link
                          href={`/products?type=${product.productType}`}
                          className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-medium"
                      >
                        {PRODUCT_TYPE_LABELS[product.productType]}
                      </Link>
                      <span
                          className={cn(
                              "px-3 py-1 rounded-full text-sm font-medium",
                              getStatusStyle(product.status)
                          )}
                      >
                      {PRODUCT_STATUS_LABELS[product.status]}
                    </span>
                      {product.soldOut && (
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                        매진
                      </span>
                      )}
                    </div>

                    {/* 제목 */}
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      {product.name}
                    </h1>

                    {/* 공연 정보 */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <p className="text-gray-700 dark:text-gray-300">{product.artHallName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{product.artHallAddress}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">
                        {formatDate(product.startAt)} ~ {formatDate(product.endAt)}
                      </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">
                        러닝타임 {product.runningTime}분
                          {product.hasIntermission && ` (인터미션 ${product.intermissionMinutes}분 포함)`}
                      </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">
                        {AGE_RATING_LABELS[product.ageRating]}
                      </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">
                        {formatPrice(minPrice)}원 ~ {formatPrice(maxPrice)}원
                      </span>
                      </div>
                    </div>

                    {/* 좌석 등급별 가격 */}
                    {product.seatGrades && product.seatGrades.length > 0 && (
                        <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            좌석 등급
                          </h3>
                          <div className="space-y-2">
                            {product.seatGrades.map((grade) => (
                                <div
                                    key={grade.id || grade.gradeName}
                                    className="flex items-center justify-between text-sm"
                                >
                            <span className="text-gray-600 dark:text-gray-400">
                              {grade.gradeName}
                            </span>
                                  <div className="flex items-center gap-4">
                              <span
                                  className={cn(
                                      "text-xs px-2 py-0.5 rounded",
                                      grade.soldOut
                                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                          : grade.availableSeats > 0
                                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  )}
                              >
                                {grade.soldOut
                                    ? "매진"
                                    : grade.availableSeats > 0
                                        ? `잔여 ${grade.availableSeats}석`
                                        : "매진"}
                              </span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                {formatPrice(grade.price)}원
                              </span>
                                  </div>
                                </div>
                            ))}
                          </div>
                        </div>
                    )}

                    {/* 예매 정보 */}
                    <div className="mb-6 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                      <p>• 1인당 최대 {product.maxTicketsPerPerson}매 예매 가능</p>
                      {product.idVerificationRequired && <p>• 본인확인 필수</p>}
                      {!product.transferable && <p>• 티켓 양도 불가</p>}
                      <p>
                        • 예매기간: {formatDateTime(product.saleStartAt)} ~{" "}
                        {formatDateTime(product.saleEndAt)}
                      </p>
                      <p>• 잔여 좌석: {product.availableSeats} / {product.totalSeats}석</p>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex gap-3">
                      <button
                          onClick={() => setIsLiked(!isLiked)}
                          className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                              isLiked
                                  ? "bg-red-100 dark:bg-red-900/30 text-red-500"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-red-500"
                          )}
                      >
                        <svg
                            className="w-6 h-6"
                            fill={isLiked ? "currentColor" : "none"}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>

                      <button
                          onClick={handleReservationClick}
                          disabled={!product.purchasable || product.soldOut}
                          className={cn(
                              "flex-1 py-3.5 px-6 rounded-xl font-semibold transition-all",
                              product.purchasable && !product.soldOut
                                  ? "bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-lg shadow-orange-500/25"
                                  : "bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                          )}
                      >
                        {product.soldOut && "매진"}
                        {!product.soldOut && product.status === "ON_SALE" && "예매하기"}
                        {!product.soldOut && product.status === "SCHEDULED" && "오픈 예정"}
                        {!product.soldOut && product.status === "CLOSED" && "판매 종료"}
                        {!product.soldOut && product.status === "COMPLETED" && "공연 종료"}
                        {!product.soldOut &&
                            !["ON_SALE", "SCHEDULED", "CLOSED", "COMPLETED"].includes(product.status) &&
                            PRODUCT_STATUS_LABELS[product.status]}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="sticky top-16 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="max-w-[1400px] mx-auto px-4">
                <div className="flex gap-8">
                  {[
                    { key: "info", label: "상세정보" },
                    { key: "notice", label: "공지사항" },
                    { key: "review", label: "관람후기" },
                  ].map((tab) => (
                      <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key as typeof activeTab)}
                          className={cn(
                              "py-4 text-sm font-medium border-b-2 transition-colors",
                              activeTab === tab.key
                                  ? "border-orange-500 text-orange-500"
                                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                          )}
                      >
                        {tab.label}
                      </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 탭 컨텐츠 */}
            <div className="max-w-[1400px] mx-auto px-4 py-8">
              {activeTab === "info" && (
                  <div>
                    {/* 상세 설명 */}
                    {product.description && (
                        <div className="prose dark:prose-invert max-w-none mb-8">
                          <div
                              className="text-gray-700 dark:text-gray-300"
                              dangerouslySetInnerHTML={{ __html: product.description }}
                          />
                        </div>
                    )}

                    {/* 출연진 */}
                    {product.castInfo && (
                        <div className="mb-8 p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            출연진
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300">{product.castInfo}</p>
                        </div>
                    )}

                    {/* 주최/주관 */}
                    {(product.organizer || product.agency) && (
                        <div className="mb-8 p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            주최/주관
                          </h3>
                          <div className="space-y-2 text-gray-700 dark:text-gray-300">
                            {product.organizer && <p>• 주최: {product.organizer}</p>}
                            {product.agency && <p>• 주관/기획: {product.agency}</p>}
                          </div>
                        </div>
                    )}

                    {/* 입장/관람 안내 */}
                    <div className="mb-8 p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        입장 안내
                      </h3>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li>• 공연 시작 {product.admissionMinutesBefore}분 전부터 입장 가능</li>
                        {!product.lateEntryAllowed && (
                            <li>• {product.lateEntryNotice || "공연 시작 후 입장 불가"}</li>
                        )}
                        {product.lateEntryAllowed && product.lateEntryNotice && (
                            <li>• 지각 입장: {product.lateEntryNotice}</li>
                        )}
                        {!product.photographyAllowed && <li>• 촬영 금지</li>}
                        {product.photographyAllowed && <li>• 촬영 가능</li>}
                        {!product.foodAllowed && <li>• 음식물 반입 금지</li>}
                        {product.foodAllowed && <li>• 음식물 반입 가능</li>}
                      </ul>
                    </div>

                    {/* 환불 안내 */}
                    {product.cancellable && (
                        <div className="mb-8 p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            환불 안내
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300">
                            {product.refundPolicyText ||
                                `공연 ${product.cancelDeadlineDays}일 전까지 취소 가능`}
                          </p>
                        </div>
                    )}

                    {!product.cancellable && (
                        <div className="mb-8 p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            환불 안내
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300">
                            본 상품은 취소/환불이 불가합니다.
                          </p>
                        </div>
                    )}

                    {/* 제한 사항 */}
                    {product.restrictionNotice && (
                        <div className="mb-8 p-6 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
                            관람 제한 안내
                          </h3>
                          <p className="text-yellow-700 dark:text-yellow-300">{product.restrictionNotice}</p>
                        </div>
                    )}

                    {/* 상세 이미지 */}
                    {detailImages.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            상세 이미지
                          </h3>
                          {detailImages.map((img, i) => (
                              <div
                                  key={i}
                                  className="relative rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800"
                              >
                                <Image
                                    src={img.trim()}
                                    alt={`상세 이미지 ${i + 1}`}
                                    width={1200}
                                    height={800}
                                    className="w-full h-auto"
                                />
                              </div>
                          ))}
                        </div>
                    )}
                  </div>
              )}

              {activeTab === "notice" && (
                  <div className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                    {product.notice ? (
                        <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300">
                    {product.notice}
                  </pre>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400">
                          등록된 공지사항이 없습니다.
                        </p>
                    )}
                  </div>
              )}

              {activeTab === "review" && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    등록된 관람후기가 없습니다.
                  </div>
              )}
            </div>
          </main>
        </div>

        {/* 대기열 모달 */}
        <QueueModal
            isOpen={showQueueModal}
            onClose={() => setShowQueueModal(false)}
            isAuthenticated={isAuthenticated}
            productName={product.name}
            onReady={handleQueueReady}
        />
      </>
  );
}