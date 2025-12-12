"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/common/Header";
import { CATEGORIES, ProductType, ProductStatus, PRODUCT_TYPE_LABELS, PRODUCT_STATUS_LABELS } from "@/types/product";
import { API_CONFIG } from "@/lib/api-client";
import { cn } from "@/lib/utils";

// 프론트엔드용 상품 목록 아이템
interface ProductListItem {
  id: number;
  name: string;
  productType: ProductType;
  status: ProductStatus;
  posterImageUrl?: string;
  artHallName: string;
  startAt: string;
  endAt: string;
  minPrice: number;
  maxPrice: number;
}

// 더미 상품 데이터
const DUMMY_PRODUCTS: ProductListItem[] = [
  {
    id: 1,
    name: "2025 아이유 콘서트 - HER",
    productType: "CONCERT",
    status: "ON_SALE",
    posterImageUrl: "https://picsum.photos/seed/product1/300/400",
    artHallName: "올림픽공원 KSPO DOME",
    startAt: "2025-03-15T18:00:00",
    endAt: "2025-03-17T21:00:00",
    minPrice: 99000,
    maxPrice: 199000,
  },
  {
    id: 2,
    name: "뮤지컬 위키드",
    productType: "MUSICAL",
    status: "ON_SALE",
    posterImageUrl: "https://picsum.photos/seed/product2/300/400",
    artHallName: "블루스퀘어 신한카드홀",
    startAt: "2025-02-01T14:00:00",
    endAt: "2025-05-31T21:00:00",
    minPrice: 70000,
    maxPrice: 170000,
  },
  {
    id: 3,
    name: "BTS WORLD TOUR",
    productType: "CONCERT",
    status: "SCHEDULED",
    posterImageUrl: "https://picsum.photos/seed/product3/300/400",
    artHallName: "서울월드컵경기장",
    startAt: "2025-06-01T18:00:00",
    endAt: "2025-06-02T21:00:00",
    minPrice: 110000,
    maxPrice: 220000,
  },
  {
    id: 4,
    name: "오페라의 유령",
    productType: "MUSICAL",
    status: "ON_SALE",
    posterImageUrl: "https://picsum.photos/seed/product4/300/400",
    artHallName: "샤롯데씨어터",
    startAt: "2025-01-10T14:00:00",
    endAt: "2025-04-30T21:00:00",
    minPrice: 60000,
    maxPrice: 150000,
  },
  {
    id: 5,
    name: "연극 햄릿",
    productType: "PLAY",
    status: "ON_SALE",
    posterImageUrl: "https://picsum.photos/seed/product5/300/400",
    artHallName: "예술의전당 자유소극장",
    startAt: "2025-03-01T19:00:00",
    endAt: "2025-03-30T21:00:00",
    minPrice: 50000,
    maxPrice: 80000,
  },
  {
    id: 6,
    name: "2025 KBO 리그 개막전",
    productType: "SPORTS",
    status: "ON_SALE",
    posterImageUrl: "https://picsum.photos/seed/product6/300/400",
    artHallName: "잠실야구장",
    startAt: "2025-03-29T14:00:00",
    endAt: "2025-03-29T17:00:00",
    minPrice: 15000,
    maxPrice: 50000,
  },
  {
    id: 7,
    name: "태양의 서커스 - KURIOS",
    productType: "MUSICAL",
    status: "SCHEDULED",
    posterImageUrl: "https://picsum.photos/seed/product7/300/400",
    artHallName: "잠실 빅탑",
    startAt: "2025-04-01T15:00:00",
    endAt: "2025-06-30T21:00:00",
    minPrice: 80000,
    maxPrice: 180000,
  },
  {
    id: 8,
    name: "뮤지컬 레미제라블",
    productType: "MUSICAL",
    status: "ON_SALE",
    posterImageUrl: "https://picsum.photos/seed/product8/300/400",
    artHallName: "블루스퀘어 신한카드홀",
    startAt: "2025-07-01T14:00:00",
    endAt: "2025-09-30T21:00:00",
    minPrice: 70000,
    maxPrice: 170000,
  },
  {
    id: 9,
    name: "세븐틴 월드투어 - FOLLOW",
    productType: "CONCERT",
    status: "CLOSED",
    posterImageUrl: "https://picsum.photos/seed/product9/300/400",
    artHallName: "고척스카이돔",
    startAt: "2025-05-10T18:00:00",
    endAt: "2025-05-12T21:00:00",
    minPrice: 110000,
    maxPrice: 198000,
  },
  {
    id: 10,
    name: "뮤지컬 시카고",
    productType: "MUSICAL",
    status: "ON_SALE",
    posterImageUrl: "https://picsum.photos/seed/product10/300/400",
    artHallName: "디큐브 링크아트센터",
    startAt: "2025-08-01T14:00:00",
    endAt: "2025-10-31T21:00:00",
    minPrice: 60000,
    maxPrice: 150000,
  },
  {
    id: 11,
    name: "연극 사람의 아들",
    productType: "PLAY",
    status: "ON_SALE",
    posterImageUrl: "https://picsum.photos/seed/product11/300/400",
    artHallName: "대학로 아트센터",
    startAt: "2025-04-01T19:30:00",
    endAt: "2025-04-30T21:30:00",
    minPrice: 40000,
    maxPrice: 60000,
  },
  {
    id: 12,
    name: "K리그 클래식 개막전",
    productType: "SPORTS",
    status: "ON_SALE",
    posterImageUrl: "https://picsum.photos/seed/product12/300/400",
    artHallName: "서울월드컵경기장",
    startAt: "2025-02-22T14:00:00",
    endAt: "2025-02-22T16:00:00",
    minPrice: 20000,
    maxPrice: 80000,
  },
];

export default function CategoryPage() {
  const params = useParams();
  const type = params.type as string;

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "price">("latest");

  // 카테고리 정보 가져오기 (QUEUE 제외)
  const categoryList = CATEGORIES.filter((c) => c.type !== "QUEUE");
  const category = categoryList.find(
      (c) => c.type.toLowerCase() === type?.toLowerCase()
  );

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}/products?productType=${type?.toUpperCase()}&status=ON_SALE`
        );

        if (response.ok) {
          const result = await response.json();
          if (result.data?.content?.length > 0) {
            setProducts(result.data.content);
          } else {
            // API 실패 시 더미 데이터
            const filtered = DUMMY_PRODUCTS.filter(
                (p) => p.productType.toLowerCase() === type?.toLowerCase()
            );
            setProducts(filtered.length > 0 ? filtered : DUMMY_PRODUCTS);
          }
        } else {
          const filtered = DUMMY_PRODUCTS.filter(
              (p) => p.productType.toLowerCase() === type?.toLowerCase()
          );
          setProducts(filtered.length > 0 ? filtered : DUMMY_PRODUCTS);
        }
      } catch {
        const filtered = DUMMY_PRODUCTS.filter(
            (p) => p.productType.toLowerCase() === type?.toLowerCase()
        );
        setProducts(filtered.length > 0 ? filtered : DUMMY_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    };

    if (type) {
      fetchProducts();
    }
  }, [type]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusStyle = (status: ProductStatus) => {
    switch (status) {
      case "ON_SALE":
        return "bg-green-500 text-white";
      case "SCHEDULED":
        return "bg-blue-500 text-white";
      case "CLOSED":
      case "COMPLETED":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header userType="CUSTOMER" bannerHeight={0} />

        {/* 카테고리 헤더 */}
        <div className="pt-16 bg-gradient-to-r from-orange-500 to-rose-500">
          <div className="max-w-[1400px] mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-white">
              {category?.label || PRODUCT_TYPE_LABELS[type?.toUpperCase() as ProductType] || type?.toUpperCase()}
            </h1>
            <p className="mt-2 text-white/80">
              다양한 {category?.label || "공연"}을 만나보세요
            </p>
          </div>
        </div>

        {/* 필터 & 정렬 */}
        <div className="sticky top-16 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-[1400px] mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                {categoryList.map((cat) => (
                    <Link
                        key={cat.type}
                        href={cat.href}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                            cat.type.toLowerCase() === type?.toLowerCase()
                                ? "bg-orange-500 text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                    >
                      {cat.label}
                    </Link>
                ))}
              </div>

              <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className={cn(
                      "px-4 py-2 rounded-lg text-sm",
                      "bg-gray-100 dark:bg-gray-800",
                      "border-none",
                      "text-gray-700 dark:text-gray-200",
                      "focus:outline-none focus:ring-2 focus:ring-orange-500"
                  )}
              >
                <option value="latest">최신순</option>
                <option value="popular">인기순</option>
                <option value="price">가격순</option>
              </select>
            </div>
          </div>
        </div>

        {/* 상품 목록 */}
        <main className="max-w-[1400px] mx-auto px-4 py-8">
          {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[3/4] rounded-xl bg-gray-200 dark:bg-gray-800" />
                      <div className="mt-3 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                      </div>
                    </div>
                ))}
              </div>
          ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  해당 카테고리에 상품이 없습니다
                </p>
              </div>
          ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.map((product) => (
                    <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="group"
                    >
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800">
                        <Image
                            src={product.posterImageUrl || `https://picsum.photos/seed/p${product.id}/300/400`}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* 상태 뱃지 */}
                        <div className="absolute top-2 left-2">
                    <span className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        getStatusStyle(product.status)
                    )}>
                      {PRODUCT_STATUS_LABELS[product.status]}
                    </span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-orange-500 transition-colors">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {product.artHallName}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(product.startAt)} ~ {formatDate(product.endAt)}
                        </p>
                        <p className="mt-2 font-semibold text-orange-500">
                          {formatPrice(product.minPrice)}원 ~
                        </p>
                      </div>
                    </Link>
                ))}
              </div>
          )}
        </main>
      </div>
  );
}