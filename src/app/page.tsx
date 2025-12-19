"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/common/Header";
import HeroBanner from "@/components/home/HeroBanner";
import { TickatchMascot } from "@/components/mascot";
import { BannerItem, ProductResponse } from "@/types/product";
import { ApiResponse, PageResponse } from "@/types/api";

// ============================================
// 배너 가공 유틸리티 함수들
// ============================================

// 상품 타입별 기본 배경 이미지 (mainImage가 없을 때 사용)
const DEFAULT_BANNER_BACKGROUNDS: Record<string, string> = {
  CONCERT: "https://picsum.photos/seed/concert-bg/1400/600",
  MUSICAL: "https://picsum.photos/seed/musical-bg/1400/600",
  PLAY: "https://picsum.photos/seed/play-bg/1400/600",
  SPORTS: "https://picsum.photos/seed/sports-bg/1400/600",
  EXHIBITION: "https://picsum.photos/seed/exhibition-bg/1400/600",
  EVENT: "https://picsum.photos/seed/event-bg/1400/600",
};

/**
 * 날짜 포맷팅 함수
 */
const formatPeriod = (startAt: string, endAt: string): string => {
  const start = new Date(startAt);
  const end = new Date(endAt);

  const formatDate = (date: Date) => {
    return date
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
  };

  // 같은 날짜면 하나만 표시
  if (start.toDateString() === end.toDateString()) {
    return formatDate(start);
  }

  return `${formatDate(start)} ~ ${formatDate(end)}`;
};

/**
 * ProductResponse를 BannerItem으로 변환하는 함수
 * mainImage가 없으므로 posterImage와 기본 배경을 조합하여 생성
 */
const productToBannerItem = (product: ProductResponse): BannerItem => {
  const productType = product.productType || "CONCERT";

  // mainImage가 없으므로 타입별 기본 배경 또는 seed 기반 이미지 생성
  const mainImage =
      DEFAULT_BANNER_BACKGROUNDS[productType] ||
      `https://picsum.photos/seed/product-${product.id}-banner/1400/600`;

  // 포스터 이미지 (있으면 사용, 없으면 기본 생성)
  const posterImage =
      product.posterImageUrl ||
      `https://picsum.photos/seed/product-${product.id}-poster/300/400`;

  return {
    id: product.id,
    title: product.name,
    subtitle: product.artHallName || "장소 미정",
    mainImage,
    posterImage,
    link: `/products/${product.id}`,
    period: formatPeriod(product.startAt, product.endAt),
    productType,
  };
};

/**
 * 상품 목록에서 배너용 아이템을 생성하는 함수
 * 우선순위: ON_SALE > SCHEDULED, 조회수 높은 순
 */
const generateBannerItems = (
    products: ProductResponse[],
    maxItems = 10
): BannerItem[] => {
  // ON_SALE 상태 우선, 그 다음 조회수 순 정렬
  const sorted = [...products].sort((a, b) => {
    // ON_SALE 우선
    if (a.status === "ON_SALE" && b.status !== "ON_SALE") return -1;
    if (a.status !== "ON_SALE" && b.status === "ON_SALE") return 1;
    // 조회수 높은 순
    return (b.viewCount || 0) - (a.viewCount || 0);
  });

  return sorted.slice(0, maxItems).map((product) => productToBannerItem(product));
};

// 더미 배너 데이터 (API 실패 시 폴백)
const DUMMY_BANNER_ITEMS: BannerItem[] = [
  {
    id: 1,
    title: "2025 아이유 콘서트\nHER",
    subtitle: "올림픽공원 KSPO DOME",
    mainImage: "https://picsum.photos/seed/iu2025/1400/600",
    posterImage: "https://picsum.photos/seed/iu2025poster/300/400",
    link: "/products/1",
    period: "2025.03.15 ~ 2025.03.17",
    productType: "CONCERT",
  },
  {
    id: 2,
    title: "뮤지컬 위키드",
    subtitle: "블루스퀘어 신한카드홀",
    mainImage: "https://picsum.photos/seed/wicked/1400/600",
    posterImage: "https://picsum.photos/seed/wickedposter/300/400",
    link: "/products/2",
    period: "2025.02.01 ~ 2025.05.31",
    productType: "MUSICAL",
  },
  {
    id: 3,
    title: "BTS WORLD TOUR\nLOVE YOURSELF",
    subtitle: "서울월드컵경기장",
    mainImage: "https://picsum.photos/seed/bts2025/1400/600",
    posterImage: "https://picsum.photos/seed/btsposter/300/400",
    link: "/products/3",
    period: "2025.06.01 ~ 2025.06.02",
    productType: "CONCERT",
  },
];

// ============================================
// 상품 카드 컴포넌트
// ============================================
interface ProductCardProps {
  product: ProductResponse;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const formatPrice = (price: number) =>
      new Intl.NumberFormat("ko-KR").format(price);

  const getMinPrice = () => {
    if (!product.seatGrades?.length) return 0;
    return Math.min(...product.seatGrades.map((g) => g.price));
  };

  return (
      <Link
          href={`/products/${product.id}`}
          className="group cursor-pointer block"
      >
        <div className="aspect-[3/4] rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden relative">
          <Image
              src={
                  product.posterImageUrl ||
                  `https://picsum.photos/seed/p${product.id}/300/400`
              }
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* 상태 뱃지 */}
          {product.status === "ON_SALE" && (
              <div className="absolute top-2 left-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-green-500 text-white">
              판매중
            </span>
              </div>
          )}
          {product.status === "SCHEDULED" && (
              <div className="absolute top-2 left-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
              오픈예정
            </span>
              </div>
          )}
        </div>
        <div className="mt-2">
          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-orange-500 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
            {product.artHallName}
          </p>
          {getMinPrice() > 0 && (
              <p className="text-sm font-semibold text-orange-500 mt-1">
                {formatPrice(getMinPrice())}원~
              </p>
          )}
        </div>
      </Link>
  );
};

// 스켈레톤 카드
const SkeletonCard = () => (
    <div className="group cursor-pointer">
      <div className="aspect-[3/4] rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden relative animate-pulse" />
      <div className="mt-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mt-1 animate-pulse" />
      </div>
    </div>
);

// ============================================
// 메인 페이지 컴포넌트
// ============================================
export default function HomePage() {
  const [bannerItems, setBannerItems] = useState<BannerItem[]>(DUMMY_BANNER_ITEMS);
  const [hotProducts, setHotProducts] = useState<ProductResponse[]>([]);
  const [concertProducts, setConcertProducts] = useState<ProductResponse[]>([]);
  const [musicalProducts, setMusicalProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bannerHeight, setBannerHeight] = useState(500);
  const bannerRef = useRef<HTMLDivElement>(null);

  // 상품 데이터 가져오기
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // 배너용 상품 (ON_SALE 상태)
        const bannerRes = await fetch("/api/products?status=ON_SALE&size=10");
        if (bannerRes.ok) {
          const bannerData: ApiResponse<PageResponse<ProductResponse>> =
              await bannerRes.json();
          const bannerProducts: ProductResponse[] = bannerData.data?.content || [];

          if (bannerProducts.length > 0) {
            setBannerItems(generateBannerItems(bannerProducts, 10));
          }
        }

        // What's Hot - 판매중 상품 중 조회수 높은 순
        const hotRes = await fetch("/api/products?status=ON_SALE&sort=viewCount,desc&size=5");
        if (hotRes.ok) {
          const hotData: ApiResponse<PageResponse<ProductResponse>> =
              await hotRes.json();
          setHotProducts(hotData.data?.content || []);
        }

        // 콘서트
        const concertRes = await fetch(
            "/api/products?productType=CONCERT&size=6"
        );
        if (concertRes.ok) {
          const concertData: ApiResponse<PageResponse<ProductResponse>> =
              await concertRes.json();
          setConcertProducts(concertData.data?.content || []);
        }

        // 뮤지컬
        const musicalRes = await fetch(
            "/api/products?productType=MUSICAL&size=6"
        );
        if (musicalRes.ok) {
          const musicalData: ApiResponse<PageResponse<ProductResponse>> =
              await musicalRes.json();
          setMusicalProducts(musicalData.data?.content || []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        // 에러 시 더미 데이터 유지
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 배너 높이 계산
  useEffect(() => {
    const updateBannerHeight = () => {
      if (bannerRef.current) {
        setBannerHeight(bannerRef.current.offsetHeight);
      }
    };

    updateBannerHeight();
    window.addEventListener("resize", updateBannerHeight);
    return () => window.removeEventListener("resize", updateBannerHeight);
  }, []);

  return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        {/* 헤더 - 배너 높이 전달 */}
        <Header userType="CUSTOMER" bannerHeight={bannerHeight} />

        {/* 메인 컨텐츠 */}
        <main className="flex-1">
          {/* 히어로 배너 */}
          <div ref={bannerRef}>
            <HeroBanner items={bannerItems} autoPlayInterval={5000} />
          </div>

          {/* What's Hot 섹션 */}
          <section className="max-w-[1400px] mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                WHAT&apos;S HOT
              </h2>
              <Link
                  href="/products"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
              >
                더보기 →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
              ) : hotProducts.length > 0 ? (
                  hotProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                  ))
              ) : (
                  <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
                    등록된 이벤트가 없습니다.
                  </p>
              )}
            </div>
          </section>

          {/* 콘서트 섹션 */}
          <section className="max-w-[1400px] mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                콘서트
              </h2>
              <Link
                  href="/products?type=CONCERT"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
              >
                더보기 →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              ) : concertProducts.length > 0 ? (
                  concertProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                  ))
              ) : (
                  <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
                    등록된 콘서트가 없습니다.
                  </p>
              )}
            </div>
          </section>

          {/* 뮤지컬 섹션 */}
          <section className="max-w-[1400px] mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                뮤지컬
              </h2>
              <Link
                  href="/products?type=MUSICAL"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
              >
                더보기 →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              ) : musicalProducts.length > 0 ? (
                  musicalProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                  ))
              ) : (
                  <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
                    등록된 뮤지컬이 없습니다.
                  </p>
              )}
            </div>
          </section>
        </main>

        {/* 푸터 */}
        <footer className="bg-gray-900 text-gray-400 py-12">
          <div className="max-w-[1400px] mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* 회사 정보 */}
              <div>
                <h3 className="text-white font-semibold mb-4">TICKATCH</h3>
                <p className="text-sm text-gray-500">최고의 공연 티케팅 서비스</p>
              </div>

              {/* 고객센터 */}
              <div>
                <h4 className="text-white font-medium mb-4">고객센터</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                        href="/help"
                        className="hover:text-white transition-colors"
                    >
                      자주 묻는 질문
                    </Link>
                  </li>
                  <li>
                    <Link
                        href="/notice"
                        className="hover:text-white transition-colors"
                    >
                      공지사항
                    </Link>
                  </li>
                  <li>
                    <Link
                        href="/contact"
                        className="hover:text-white transition-colors"
                    >
                      1:1 문의
                    </Link>
                  </li>
                </ul>
              </div>

              {/* 이용안내 */}
              <div>
                <h4 className="text-white font-medium mb-4">이용안내</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                        href="/terms"
                        className="hover:text-white transition-colors"
                    >
                      이용약관
                    </Link>
                  </li>
                  <li>
                    <Link
                        href="/privacy"
                        className="hover:text-white transition-colors"
                    >
                      개인정보처리방침
                    </Link>
                  </li>
                  <li>
                    <Link
                        href="/refund"
                        className="hover:text-white transition-colors"
                    >
                      취소/환불 안내
                    </Link>
                  </li>
                </ul>
              </div>

              {/* 파트너 */}
              <div>
                <h4 className="text-white font-medium mb-4">파트너</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                        href="/seller"
                        className="hover:text-white transition-colors"
                    >
                      판매자 센터
                    </Link>
                  </li>
                  <li>
                    <Link
                        href="/partnership"
                        className="hover:text-white transition-colors"
                    >
                      제휴 문의
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 text-center text-sm">
              <p>© 2025 Tickatch. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* 티캐치 마스코트 챗봇 */}
        <TickatchMascot size="md" />
      </div>
  );
}