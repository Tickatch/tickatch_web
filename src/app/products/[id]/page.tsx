"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/common/Header";
import { ProductResponse, PRODUCT_TYPE_LABELS, PRODUCT_STATUS_LABELS, AGE_RATING_LABELS } from "@/types/product";
import { API_CONFIG } from "@/lib/api-client";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

// 더미 상품 상세
const DUMMY_PRODUCT: ProductResponse = {
  id: 1,
  name: "2025 아이유 콘서트 - HER",
  productType: "CONCERT",
  status: "ON_SALE",

  // 일정
  startAt: "2025-03-15T18:00:00",
  endAt: "2025-03-17T21:00:00",
  saleStartAt: "2025-02-01T10:00:00",
  saleEndAt: "2025-03-14T23:59:59",
  runningTime: 150,

  // 장소
  stageId: 1,
  stageName: "메인홀",
  artHallId: 1,
  artHallName: "올림픽공원 KSPO DOME",
  artHallAddress: "서울특별시 송파구 올림픽로 424",

  // 콘텐츠
  description: `[공연 안내]
아이유의 2025년 단독 콘서트 'HER'가 올림픽공원 KSPO DOME에서 개최됩니다.

이번 콘서트는 아이유의 15주년을 기념하는 특별한 공연으로, 
데뷔 초기부터 현재까지의 다양한 히트곡들을 선보일 예정입니다.

[공연 시간]
약 150분 (인터미션 포함)

[좌석 안내]
VIP석: 199,000원
R석: 154,000원
S석: 121,000원
A석: 99,000원`,
  posterImageUrl: "https://picsum.photos/seed/iu2025/600/800",
  detailImageUrls: "https://picsum.photos/seed/iu1/800/600,https://picsum.photos/seed/iu2/800/600,https://picsum.photos/seed/iu3/800/600",
  castInfo: "아이유",
  notice: "본 공연은 전석 지정석입니다.",
  organizer: "EDAM엔터테인먼트",
  agency: "티캣치",

  // 관람 제한
  ageRating: "ALL",
  restrictionNotice: "8세 미만 입장 불가",

  // 예매 정책
  maxTicketsPerPerson: 4,
  idVerificationRequired: true,
  transferable: false,

  // 입장 정책
  admissionMinutesBefore: 30,
  lateEntryAllowed: false,
  lateEntryNotice: "공연 시작 후 입장이 제한됩니다.",
  hasIntermission: true,
  intermissionMinutes: 20,
  photographyAllowed: false,
  foodAllowed: false,

  // 환불 정책
  cancellable: true,
  cancelDeadlineDays: 7,
  refundPolicyText: "공연 7일 전까지 전액 환불 가능",

  // 좌석 정보
  seatGrades: [
    { gradeName: "VIP석", price: 199000, totalSeats: 500, availableSeats: 120 },
    { gradeName: "R석", price: 154000, totalSeats: 1000, availableSeats: 350 },
    { gradeName: "S석", price: 121000, totalSeats: 2000, availableSeats: 800 },
    { gradeName: "A석", price: 99000, totalSeats: 1500, availableSeats: 600 },
  ],
  totalSeats: 5000,
  availableSeats: 1870,

  // 메타
  viewCount: 15420,
  sellerId: "seller-001",
  createdAt: "2025-01-15T10:00:00",
  updatedAt: "2025-02-20T15:30:00",
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "notice" | "review">("info");
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/products/${productId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            setProduct(result.data);
          } else {
            setProduct(DUMMY_PRODUCT);
          }
        } else {
          setProduct(DUMMY_PRODUCT);
        }
      } catch {
        setProduct(DUMMY_PRODUCT);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleReservation = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${productId}`);
      return;
    }

    // 대기열 페이지로 이동
    router.push(`/queue?productId=${productId}`);
  };

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

  const getMinPrice = () => {
    if (!product?.seatGrades?.length) return 0;
    return Math.min(...product.seatGrades.map((g) => g.price));
  };

  const getMaxPrice = () => {
    if (!product?.seatGrades?.length) return 0;
    return Math.max(...product.seatGrades.map((g) => g.price));
  };

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

  if (!product) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <Header userType="CUSTOMER" bannerHeight={0} />
          <div className="pt-16 flex flex-col items-center justify-center min-h-[60vh]">
            <p className="text-gray-500 dark:text-gray-400 mb-4">상품을 찾을 수 없습니다</p>
            <Link href="/" className="text-orange-500 hover:underline">
              홈으로 돌아가기
            </Link>
          </div>
        </div>
    );
  }

  const detailImages = product.detailImageUrls?.split(",").filter(Boolean) || [];

  return (
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
                        src={product.posterImageUrl || "https://picsum.photos/seed/default/300/400"}
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
                        href={`/category/${product.productType.toLowerCase()}`}
                        className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-medium"
                    >
                      {PRODUCT_TYPE_LABELS[product.productType]}
                    </Link>
                    <span className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium",
                        getStatusStyle(product.status)
                    )}>
                    {PRODUCT_STATUS_LABELS[product.status]}
                  </span>
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
                      {formatPrice(getMinPrice())}원 ~ {formatPrice(getMaxPrice())}원
                    </span>
                    </div>
                  </div>

                  {/* 좌석 등급별 가격 */}
                  {product.seatGrades && product.seatGrades.length > 0 && (
                      <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">좌석 등급</h3>
                        <div className="space-y-2">
                          {product.seatGrades.map((grade) => (
                              <div key={grade.gradeName} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">{grade.gradeName}</span>
                                <div className="flex items-center gap-4">
                            <span className="text-gray-400 dark:text-gray-500">
                              잔여 {grade.availableSeats}석
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
                    <p>• 예매기간: {formatDateTime(product.saleStartAt)} ~ {formatDateTime(product.saleEndAt)}</p>
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
                      <svg className="w-6 h-6" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>

                    <button
                        onClick={handleReservation}
                        disabled={product.status !== "ON_SALE"}
                        className={cn(
                            "flex-1 py-3.5 px-6 rounded-xl font-semibold transition-all",
                            product.status === "ON_SALE"
                                ? "bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-lg shadow-orange-500/25"
                                : "bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                        )}
                    >
                      {product.status === "ON_SALE" && "예매하기"}
                      {product.status === "SCHEDULED" && "오픈 예정"}
                      {product.status === "CLOSED" && "판매 종료"}
                      {product.status === "COMPLETED" && "공연 종료"}
                      {!["ON_SALE", "SCHEDULED", "CLOSED", "COMPLETED"].includes(product.status) && PRODUCT_STATUS_LABELS[product.status]}
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
                  <div className="prose dark:prose-invert max-w-none mb-8">
                <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 bg-transparent p-0 border-none">
                  {product.description}
                </pre>
                  </div>

                  {/* 출연진 */}
                  {product.castInfo && (
                      <div className="mb-8 p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">출연진</h3>
                        <p className="text-gray-700 dark:text-gray-300">{product.castInfo}</p>
                      </div>
                  )}

                  {/* 입장/관람 안내 */}
                  <div className="mb-8 p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">입장 안내</h3>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li>• 공연 시작 {product.admissionMinutesBefore}분 전부터 입장 가능</li>
                      {!product.lateEntryAllowed && <li>• {product.lateEntryNotice || "공연 시작 후 입장 불가"}</li>}
                      {!product.photographyAllowed && <li>• 촬영 금지</li>}
                      {!product.foodAllowed && <li>• 음식물 반입 금지</li>}
                    </ul>
                  </div>

                  {/* 환불 안내 */}
                  {product.cancellable && (
                      <div className="mb-8 p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">환불 안내</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {product.refundPolicyText || `공연 ${product.cancelDeadlineDays}일 전까지 취소 가능`}
                        </p>
                      </div>
                  )}

                  {/* 상세 이미지 */}
                  {detailImages.length > 0 && (
                      <div className="space-y-4">
                        {detailImages.map((img, i) => (
                            <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800">
                              <Image src={img.trim()} alt={`상세 이미지 ${i + 1}`} fill className="object-cover" />
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
  );
}