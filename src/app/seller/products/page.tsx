"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable, Column } from "@/components/dashboard";
import {
  ProductResponse,
  ProductStatus,
  PRODUCT_STATUS_LABELS,
  PRODUCT_TYPE_LABELS,
  getStatusColor,
  getProductTypeColor,
} from "@/types/product";
import { cn } from "@/lib/utils";

const statusFilters: { value: ProductStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "DRAFT", label: "임시저장" },
  { value: "PENDING", label: "심사대기" },
  { value: "APPROVED", label: "승인됨" },
  { value: "REJECTED", label: "반려됨" },
  { value: "SCHEDULED", label: "예매예정" },
  { value: "ON_SALE", label: "판매중" },
  { value: "CLOSED", label: "판매종료" },
];

export default function SellerProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || "ALL";

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sellerId, setSellerId] = useState<string | null>(null);

  // 판매자 정보 가져오기
  useEffect(() => {
    const fetchSellerInfo = async () => {
      try {
        const response = await fetch("/api/user/sellers/me");
        if (response.ok) {
          const data = await response.json();
          setSellerId(data.data?.id || data.id);
        }
      } catch (error) {
        console.error("Failed to fetch seller info:", error);
      }
    };
    fetchSellerInfo();
  }, []);

  // 상품 목록 가져오기
  useEffect(() => {
    if (!sellerId) return;

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let url = `/api/products?sellerId=${sellerId}&size=100`;
        if (statusFilter !== "ALL") {
          url += `&status=${statusFilter}`;
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data?.content || data.content || []);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [sellerId, statusFilter]);

  const filteredProducts = searchQuery
      ? products.filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      : products;

  const columns: Column<ProductResponse>[] = [
    {
      key: "id",
      label: "ID",
      className: "w-16",
    },
    {
      key: "name",
      label: "상품명",
      render: (item) => (
          <div className="max-w-xs">
            <div className="font-medium truncate">{item.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {item.artHallName}
            </div>
          </div>
      ),
    },
    {
      key: "productType",
      label: "유형",
      render: (item) => (
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getProductTypeColor(item.productType))}>
          {PRODUCT_TYPE_LABELS[item.productType]}
        </span>
      ),
    },
    {
      key: "status",
      label: "상태",
      render: (item) => (
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(item.status))}>
          {PRODUCT_STATUS_LABELS[item.status]}
        </span>
      ),
    },
    {
      key: "schedule",
      label: "공연 일정",
      render: (item) => (
          <div className="text-sm">
            <div>{new Date(item.startAt).toLocaleDateString("ko-KR")}</div>
            <div className="text-xs text-gray-500">
              ~ {new Date(item.endAt).toLocaleDateString("ko-KR")}
            </div>
          </div>
      ),
    },
    {
      key: "seats",
      label: "좌석 현황",
      render: (item) => {
        const soldPercentage = ((item.totalSeats - item.availableSeats) / item.totalSeats) * 100;
        return (
            <div className="text-sm">
              <div className="flex items-center gap-1">
              <span className="text-green-600 dark:text-green-400 font-medium">
                {item.availableSeats}
              </span>
                <span className="text-gray-400">/</span>
                <span>{item.totalSeats}</span>
              </div>
              <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${soldPercentage}%` }}
                />
              </div>
            </div>
        );
      },
    },
    {
      key: "actions",
      label: "",
      className: "w-32",
      render: (item) => (
          <div className="flex items-center gap-2">
            <Link
                href={`/seller/products/${item.id}`}
                className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
              상세
            </Link>
            {(item.status === "DRAFT" || item.status === "REJECTED") && (
                <Link
                    href={`/seller/products/${item.id}/edit`}
                    className="px-3 py-1.5 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                  수정
                </Link>
            )}
          </div>
      ),
    },
  ];

  return (
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              상품 목록
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              등록된 상품을 관리하세요.
            </p>
          </div>
          <Link
              href="/seller/products/new"
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 상품 등록
          </Link>
        </div>

        {/* 필터 & 검색 */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 상태 필터 */}
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
                <button
                    key={filter.value}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      if (filter.value === "ALL") {
                        params.delete("status");
                      } else {
                        params.set("status", filter.value);
                      }
                      router.push(`/seller/products?${params.toString()}`);
                    }}
                    className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                        statusFilter === filter.value
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                >
                  {filter.label}
                </button>
            ))}
          </div>

          {/* 검색 */}
          <div className="flex-1 max-w-md ml-auto">
            <div className="relative">
              <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                  type="text"
                  placeholder="상품명 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* 상품 테이블 */}
        <DataTable
            columns={columns}
            data={filteredProducts}
            keyField="id"
            onRowClick={(item) => router.push(`/seller/products/${item.id}`)}
            isLoading={isLoading}
            emptyMessage="등록된 상품이 없습니다."
        />
      </div>
  );
}