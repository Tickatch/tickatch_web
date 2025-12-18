"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  posterImageUrl?: string;
  artHallName: string;
  startAt: string;
  endAt: string;
  minPrice: number;
  status: "ON_SALE" | "SCHEDULED" | "CLOSED";
  addedAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  ON_SALE: "판매중",
  SCHEDULED: "오픈예정",
  CLOSED: "판매종료",
};

const STATUS_COLORS: Record<string, string> = {
  ON_SALE: "bg-green-500 text-white",
  SCHEDULED: "bg-blue-500 text-white",
  CLOSED: "bg-gray-500 text-white",
};

// 더미 데이터
const DUMMY_WISHLIST: WishlistItem[] = [
  {
    id: 1,
    productId: 3,
    productName: "BTS WORLD TOUR - LOVE YOURSELF",
    posterImageUrl: "https://picsum.photos/seed/bts2025/300/400",
    artHallName: "서울월드컵경기장",
    startAt: "2025-06-01T18:00:00",
    endAt: "2025-06-02T21:00:00",
    minPrice: 110000,
    status: "SCHEDULED",
    addedAt: "2025-01-20T14:00:00",
  },
  {
    id: 2,
    productId: 4,
    productName: "오페라의 유령",
    posterImageUrl: "https://picsum.photos/seed/phantom/300/400",
    artHallName: "샤롯데씨어터",
    startAt: "2025-01-10T14:00:00",
    endAt: "2025-04-30T21:00:00",
    minPrice: 60000,
    status: "ON_SALE",
    addedAt: "2025-01-18T10:30:00",
  },
];

export default function WishlistPage() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        // TODO: 실제 API 연동
        // const response = await fetch("/api/wishlist");
        // const result = await response.json();
        // if (result.success && result.data) {
        //   setWishlist(result.data);
        // }

        await new Promise((resolve) => setTimeout(resolve, 500));
        setWishlist(DUMMY_WISHLIST);
      } catch (error) {
        console.error("Wishlist fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const handleRemove = async (wishlistId: number) => {
    if (!confirm("찜 목록에서 삭제하시겠습니까?")) return;

    try {
      // TODO: 실제 API 연동
      // await fetch(`/api/wishlist/${wishlistId}`, { method: "DELETE" });

      setWishlist((prev) => prev.filter((w) => w.id !== wishlistId));
    } catch (error) {
      console.error("Remove error:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  if (isLoading) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              찜 목록
            </h1>
          </div>

          <div className="p-6">
            {wishlist.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                      className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">
                    찜한 공연이 없습니다.
                  </p>
                  <Link
                      href="/products"
                      className="inline-block mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                  >
                    공연 둘러보기
                  </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((item) => (
                      <div
                          key={item.id}
                          className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                      >
                        {/* 포스터 */}
                        <Link
                            href={`/products/${item.productId}`}
                            className="w-24 h-32 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0"
                        >
                          <Image
                              src={item.posterImageUrl || `https://picsum.photos/seed/w${item.id}/200/280`}
                              alt={item.productName}
                              width={96}
                              height={128}
                              className="w-full h-full object-cover"
                          />
                        </Link>

                        {/* 정보 */}
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-2 mb-1">
                      <span
                          className={cn(
                              "px-2 py-0.5 rounded text-xs font-medium",
                              STATUS_COLORS[item.status]
                          )}
                      >
                        {STATUS_LABELS[item.status]}
                      </span>
                            <button
                                onClick={() => handleRemove(item.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                title="찜 해제"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>
                          </div>

                          <Link
                              href={`/products/${item.productId}`}
                              className="font-semibold text-gray-900 dark:text-white hover:text-orange-500 transition-colors line-clamp-2 mb-1"
                          >
                            {item.productName}
                          </Link>

                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 line-clamp-1">
                            {item.artHallName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            {formatDate(item.startAt)} ~ {formatDate(item.endAt)}
                          </p>

                          <div className="mt-auto flex items-center justify-between">
                      <span className="font-semibold text-orange-500">
                        {formatPrice(item.minPrice)}원~
                      </span>
                            {item.status === "ON_SALE" && (
                                <Link
                                    href={`/products/${item.productId}`}
                                    className="px-3 py-1.5 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                                >
                                  예매하기
                                </Link>
                            )}
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </div>
      </div>
  );
}