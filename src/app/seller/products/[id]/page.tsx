"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ProductResponse,
  ProductStatus,
  PRODUCT_TYPE_LABELS,
  PRODUCT_STATUS_LABELS,
  AGE_RATING_LABELS,
  getStatusColor,
  getProductTypeColor,
} from "@/types/product";

// 더미 상품 상세
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
  description: "2025년 아이유의 새로운 콘서트 HER. 팬들과 함께하는 특별한 시간을 준비했습니다.",
  posterImageUrl: "https://picsum.photos/400/600",
  castInfo: "아이유",
  notice: "본 공연은 전석 지정석입니다.",
  organizer: "EDAM엔터테인먼트",
  agency: "카카오엔터테인먼트",
  ageRating: "ALL",
  restrictionNotice: "",
  maxTicketsPerPerson: 4,
  idVerificationRequired: true,
  transferable: false,
  admissionMinutesBefore: 30,
  lateEntryAllowed: false,
  lateEntryNotice: "공연 시작 후 입장이 제한됩니다.",
  hasIntermission: true,
  intermissionMinutes: 20,
  photographyAllowed: false,
  foodAllowed: false,
  cancellable: true,
  cancelDeadlineDays: 7,
  refundPolicyText: "공연 7일 전까지 전액 환불 가능",
  seatGrades: [
    { gradeName: "VIP석", price: 199000, totalSeats: 200, availableSeats: 50 },
    { gradeName: "R석", price: 154000, totalSeats: 300, availableSeats: 120 },
    { gradeName: "S석", price: 121000, totalSeats: 300, availableSeats: 190 },
  ],
  totalSeats: 800,
  availableSeats: 360,
  viewCount: 15420,
  sellerId: "seller-001",
  createdAt: "2025-01-15T10:00:00",
  updatedAt: "2025-02-20T15:30:00",
};

export default function SellerProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "seats" | "stats">("info");

  useEffect(() => {
    // TODO: 실제 API 호출
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setProduct({ ...DUMMY_PRODUCT, id: Number(productId) });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleStatusChange = async (newStatus: ProductStatus) => {
    if (!product) return;

    const confirmed = confirm(`상품 상태를 "${PRODUCT_STATUS_LABELS[newStatus]}"(으)로 변경하시겠습니까?`);
    if (!confirmed) return;

    try {
      // TODO: 실제 API 호출
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProduct({ ...product, status: newStatus });
      alert("상태가 변경되었습니다.");
    } catch (error) {
      alert("상태 변경에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  if (!product) {
    return (
        <div className="text-center py-12">
          <p className="text-gray-500">상품을 찾을 수 없습니다.</p>
          <Link href="/seller/products" className="text-orange-500 hover:underline mt-2 inline-block">
            목록으로 돌아가기
          </Link>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                  href="/seller/products"
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ← 목록
              </Link>
              <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getProductTypeColor(product.productType))}>
              {PRODUCT_TYPE_LABELS[product.productType]}
            </span>
              <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(product.status))}>
              {PRODUCT_STATUS_LABELS[product.status]}
            </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {product.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {product.artHallName} · {product.stageName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {product.status === "DRAFT" && (
                <button
                    onClick={() => handleStatusChange("PENDING")}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                >
                  심사 요청
                </button>
            )}
            {product.status === "APPROVED" && (
                <button
                    onClick={() => handleStatusChange("ON_SALE")}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  판매 시작
                </button>
            )}
            {product.status === "ON_SALE" && (
                <button
                    onClick={() => handleStatusChange("CLOSED")}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  판매 종료
                </button>
            )}
            <Link
                href={`/seller/products/${product.id}/edit`}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-rose-600 transition-colors"
            >
              수정하기
            </Link>
          </div>
        </div>

        {/* 탭 */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="flex gap-8">
            {[
              { key: "info", label: "기본 정보" },
              { key: "seats", label: "좌석 현황" },
              { key: "stats", label: "통계" },
            ].map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={cn(
                        "pb-3 text-sm font-medium border-b-2 transition-colors",
                        activeTab === tab.key
                            ? "border-orange-500 text-orange-500"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                >
                  {tab.label}
                </button>
            ))}
          </nav>
        </div>

        {/* 기본 정보 탭 */}
        {activeTab === "info" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 왼쪽: 포스터 */}
              <div>
                {product.posterImageUrl ? (
                    <img
                        src={product.posterImageUrl}
                        alt={product.name}
                        className="w-full rounded-xl shadow-lg"
                    />
                ) : (
                    <div className="w-full aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                      <span className="text-gray-400">포스터 없음</span>
                    </div>
                )}
              </div>

              {/* 오른쪽: 정보 */}
              <div className="lg:col-span-2 space-y-6">
                {/* 일정 */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">일정</h3>
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-gray-500">공연 기간</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">
                        {new Date(product.startAt).toLocaleDateString("ko-KR")} ~{" "}
                        {new Date(product.endAt).toLocaleDateString("ko-KR")}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">판매 기간</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">
                        {new Date(product.saleStartAt).toLocaleDateString("ko-KR")} ~{" "}
                        {new Date(product.saleEndAt).toLocaleDateString("ko-KR")}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">러닝타임</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{product.runningTime}분</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">인터미션</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">
                        {product.hasIntermission ? `${product.intermissionMinutes}분` : "없음"}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* 정책 */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">정책</h3>
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-gray-500">관람 등급</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{AGE_RATING_LABELS[product.ageRating]}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">1인 최대 구매</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{product.maxTicketsPerPerson}매</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">본인 확인</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{product.idVerificationRequired ? "필수" : "선택"}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">양도 가능</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{product.transferable ? "가능" : "불가"}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">취소 가능</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">
                        {product.cancellable ? `공연 ${product.cancelDeadlineDays}일 전까지` : "불가"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">촬영/음식</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">
                        {product.photographyAllowed ? "촬영 가능" : "촬영 불가"} /{" "}
                        {product.foodAllowed ? "음식 허용" : "음식 불가"}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* 설명 */}
                {product.description && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">상품 설명</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {product.description}
                      </p>
                    </div>
                )}
              </div>
            </div>
        )}

        {/* 좌석 현황 탭 */}
        {activeTab === "seats" && (
            <div className="space-y-6">
              {/* 전체 현황 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center">
                  <p className="text-sm text-gray-500">총 좌석</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {product.totalSeats.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center">
                  <p className="text-sm text-gray-500">판매됨</p>
                  <p className="text-3xl font-bold text-green-500 mt-1">
                    {(product.totalSeats - product.availableSeats).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center">
                  <p className="text-sm text-gray-500">잔여</p>
                  <p className="text-3xl font-bold text-orange-500 mt-1">
                    {product.availableSeats.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* 등급별 현황 */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">등급별 현황</h3>
                <div className="space-y-4">
                  {product.seatGrades?.map((grade) => {
                    const soldPercent = ((grade.totalSeats - grade.availableSeats) / grade.totalSeats) * 100;
                    return (
                        <div key={grade.gradeName} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {grade.gradeName}
                      </span>
                            <span className="text-gray-500">
                        {grade.price.toLocaleString()}원 · {grade.totalSeats - grade.availableSeats}/{grade.totalSeats}석 판매
                      </span>
                          </div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full transition-all"
                                style={{ width: `${soldPercent}%` }}
                            />
                          </div>
                        </div>
                    );
                  })}
                </div>
              </div>
            </div>
        )}

        {/* 통계 탭 */}
        {activeTab === "stats" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center">
                  <p className="text-sm text-gray-500">조회수</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {product.viewCount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center">
                  <p className="text-sm text-gray-500">예매율</p>
                  <p className="text-2xl font-bold text-green-500 mt-1">
                    {(((product.totalSeats - product.availableSeats) / product.totalSeats) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center">
                  <p className="text-sm text-gray-500">예상 매출</p>
                  <p className="text-2xl font-bold text-blue-500 mt-1">
                    {((product.seatGrades?.reduce((sum, g) => sum + (g.totalSeats - g.availableSeats) * g.price, 0) || 0) / 10000).toLocaleString()}만원
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center">
                  <p className="text-sm text-gray-500">등록일</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {new Date(product.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  📊 상세 통계 및 분석 기능은 추후 업데이트 예정입니다.
                </p>
              </div>
            </div>
        )}
      </div>
  );
}