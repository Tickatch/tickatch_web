"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/common/Header";
import {
  ProductType,
  ProductStatus,
  ProductResponse,
  PRODUCT_TYPE_LABELS,
  PRODUCT_STATUS_LABELS,
  CATEGORIES,
  getProductTypeColor,
} from "@/types/product";
import { ApiResponse, PageResponse } from "@/types/api";
import { cn } from "@/lib/utils";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const typeParam = searchParams.get("type")?.toUpperCase() as ProductType | null;

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "price">("latest");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 카테고리 목록 (QUEUE 제외)
  const categoryList = CATEGORIES.filter((c) => c.type !== "QUEUE");

  // 현재 선택된 타입
  const currentType = typeParam || "ALL";
  const currentLabel =
      currentType === "ALL"
          ? "전체"
          : PRODUCT_TYPE_LABELS[currentType as ProductType] || currentType;

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("page", currentPage.toString());
        params.set("size", "20");

        if (typeParam) {
          params.set("productType", typeParam);
        }

        // 정렬
        if (sortBy === "popular") {
          params.set("sort", "viewCount,desc");
        } else if (sortBy === "price") {
          params.set("sort", "minPrice,asc");
        } else {
          params.set("sort", "createdAt,desc");
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        const result: ApiResponse<PageResponse<ProductResponse>> =
            await response.json();

        if (result.success && result.data) {
          setProducts(result.data.content || []);
          setTotalPages(result.data.pageInfo?.totalPages || 0);
        } else {
          setProducts([]);
          setError(result.error?.message || "상품을 불러오는데 실패했습니다.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setProducts([]);
        setError("상품을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [typeParam, currentPage, sortBy]);

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

  const getMinPrice = (product: ProductResponse) => {
    if (!product.seatGrades?.length) return 0;
    return Math.min(...product.seatGrades.map((g) => g.price));
  };

  const handleCategoryChange = (type: string) => {
    setCurrentPage(0);
    if (type === "ALL") {
      router.push("/products");
    } else {
      router.push(`/products?type=${type}`);
    }
  };

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header userType="CUSTOMER" bannerHeight={0} />

        {/* 카테고리 헤더 */}
        <div className="pt-16 bg-gradient-to-r from-orange-500 to-rose-500">
          <div className="max-w-[1400px] mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-white">{currentLabel}</h1>
            <p className="mt-2 text-white/80">
              {currentType === "ALL"
                  ? "모든 공연/행사를 만나보세요"
                  : `다양한 ${currentLabel}을 만나보세요`}
            </p>
          </div>
        </div>

        {/* 필터 & 정렬 */}
        <div className="sticky top-16 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-[1400px] mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                {categoryList.map((cat) => (
                    <button
                        key={cat.type}
                        onClick={() => handleCategoryChange(cat.type)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                            cat.type === currentType
                                ? "bg-orange-500 text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                    >
                      {cat.label}
                    </button>
                ))}
              </div>

              <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as typeof sortBy);
                    setCurrentPage(0);
                  }}
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
          {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
          )}

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
                  <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  {currentType === "ALL"
                      ? "등록된 상품이 없습니다"
                      : `해당 카테고리에 상품이 없습니다`}
                </p>
              </div>
          ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {products.map((product) => (
                      <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          className="group"
                      >
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800">
                          <Image
                              src={
                                  product.posterImageUrl ||
                                  `https://picsum.photos/seed/p${product.id}/300/400`
                              }
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                          {/* 상태 뱃지 */}
                          <div className="absolute top-2 left-2 flex gap-1">
                      <span
                          className={cn(
                              "px-2 py-1 rounded text-xs font-medium",
                              getStatusStyle(product.status)
                          )}
                      >
                        {PRODUCT_STATUS_LABELS[product.status]}
                      </span>
                          </div>

                          {/* 카테고리 뱃지 (전체 보기일 때만) */}
                          {currentType === "ALL" && (
                              <div className="absolute top-2 right-2">
                        <span
                            className={cn(
                                "px-2 py-1 rounded text-xs font-medium",
                                getProductTypeColor(product.productType)
                            )}
                        >
                          {PRODUCT_TYPE_LABELS[product.productType]}
                        </span>
                              </div>
                          )}
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
                          {getMinPrice(product) > 0 && (
                              <p className="mt-2 font-semibold text-orange-500">
                                {formatPrice(getMinPrice(product))}원 ~
                              </p>
                          )}
                        </div>
                      </Link>
                  ))}
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                      <button
                          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                          disabled={currentPage === 0}
                          className="px-4 py-2 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
                      >
                        이전
                      </button>
                      <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                  {currentPage + 1} / {totalPages}
                </span>
                      <button
                          onClick={() =>
                              setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                          }
                          disabled={currentPage >= totalPages - 1}
                          className="px-4 py-2 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
                      >
                        다음
                      </button>
                    </div>
                )}
              </>
          )}
        </main>
      </div>
  );
}

export default function ProductsPage() {
  return (
      <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }
      >
        <ProductsContent />
      </Suspense>
  );
}