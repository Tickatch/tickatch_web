"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Header from "@/components/common/Header";
import HeroBanner from "@/components/home/HeroBanner";
import { BannerItem, ProductResponse, productToBannerItem } from "@/types/product";
import { API_CONFIG } from "@/lib/api-client";

// 더미 배너 데이터
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
  {
    id: 4,
    title: "오페라의 유령",
    subtitle: "샤롯데씨어터",
    mainImage: "https://picsum.photos/seed/phantom/1400/600",
    posterImage: "https://picsum.photos/seed/phantomposter/300/400",
    link: "/products/4",
    period: "2025.01.10 ~ 2025.04.30",
    productType: "MUSICAL",
  },
  {
    id: 5,
    title: "연극 햄릿",
    subtitle: "예술의전당 자유소극장",
    mainImage: "https://picsum.photos/seed/hamlet/1400/600",
    posterImage: "https://picsum.photos/seed/hamletposter/300/400",
    link: "/products/5",
    period: "2025.03.01 ~ 2025.03.30",
    productType: "PLAY",
  },
  {
    id: 6,
    title: "2025 KBO 리그\n개막전",
    subtitle: "잠실야구장",
    mainImage: "https://picsum.photos/seed/kbo2025/1400/600",
    posterImage: "https://picsum.photos/seed/kboposter/300/400",
    link: "/products/6",
    period: "2025.03.29",
    productType: "SPORTS",
  },
  {
    id: 7,
    title: "태양의 서커스\nKURIOS",
    subtitle: "잠실 빅탑",
    mainImage: "https://picsum.photos/seed/cirque/1400/600",
    posterImage: "https://picsum.photos/seed/cirqueposter/300/400",
    link: "/products/7",
    period: "2025.04.01 ~ 2025.06.30",
    productType: "MUSICAL",
  },
  {
    id: 8,
    title: "뮤지컬 레미제라블",
    subtitle: "블루스퀘어 신한카드홀",
    mainImage: "https://picsum.photos/seed/lesmis/1400/600",
    posterImage: "https://picsum.photos/seed/lesmisposter/300/400",
    link: "/products/8",
    period: "2025.07.01 ~ 2025.09.30",
    productType: "MUSICAL",
  },
  {
    id: 9,
    title: "세븐틴 월드투어\nFOLLOW",
    subtitle: "고척스카이돔",
    mainImage: "https://picsum.photos/seed/svt2025/1400/600",
    posterImage: "https://picsum.photos/seed/svtposter/300/400",
    link: "/products/9",
    period: "2025.05.10 ~ 2025.05.12",
    productType: "CONCERT",
  },
  {
    id: 10,
    title: "뮤지컬 시카고",
    subtitle: "디큐브 링크아트센터",
    mainImage: "https://picsum.photos/seed/chicago/1400/600",
    posterImage: "https://picsum.photos/seed/chicagoposter/300/400",
    link: "/products/10",
    period: "2025.08.01 ~ 2025.10.31",
    productType: "MUSICAL",
  },
];

export default function HomePage() {
  const [bannerItems, setBannerItems] = useState<BannerItem[]>(DUMMY_BANNER_ITEMS);
  const [bannerHeight, setBannerHeight] = useState(500);
  const bannerRef = useRef<HTMLDivElement>(null);

  // 상품 데이터 가져오기 (API 성공 시 실제 데이터로 대체)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
            `${API_CONFIG.BASE_URL}/products?status=ON_SALE&size=10`
        );

        if (!res.ok) {
          console.error("Failed to fetch products:", res.status);
          // API 실패 시 더미 데이터 유지
          return;
        }

        const data = await res.json();
        const products: ProductResponse[] = data.data?.content || [];

        // 실제 데이터가 있으면 교체, 없으면 더미 유지
        if (products.length > 0) {
          setBannerItems(products.map(productToBannerItem));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        // 에러 시 더미 데이터 유지
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
              {/* 플레이스홀더 카드들 - 추후 상품 카드 컴포넌트로 교체 */}
              {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="aspect-[3/4] rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="mt-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mt-1" />
                    </div>
                  </div>
              ))}
            </div>
          </section>

          {/* 카테고리별 추천 섹션 */}
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
              {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="aspect-[3/4] rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="mt-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mt-1" />
                    </div>
                  </div>
              ))}
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
              {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="aspect-[3/4] rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="mt-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mt-1" />
                    </div>
                  </div>
              ))}
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
                    <Link href="/help" className="hover:text-white transition-colors">
                      자주 묻는 질문
                    </Link>
                  </li>
                  <li>
                    <Link href="/notice" className="hover:text-white transition-colors">
                      공지사항
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-white transition-colors">
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
                    <Link href="/terms" className="hover:text-white transition-colors">
                      이용약관
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-white transition-colors">
                      개인정보처리방침
                    </Link>
                  </li>
                  <li>
                    <Link href="/refund" className="hover:text-white transition-colors">
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
                    <Link href="/seller" className="hover:text-white transition-colors">
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
      </div>
  );
}