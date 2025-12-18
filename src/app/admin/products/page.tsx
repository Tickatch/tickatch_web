"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataTable, Column } from "@/components/dashboard";
import {
  ProductResponse,
  ProductStatus,
  ProductType,
  PRODUCT_STATUS_LABELS,
  PRODUCT_TYPE_LABELS,
  getStatusColor,
  getProductTypeColor,
} from "@/types/product";
import { ApiResponse, PageResponse, PageInfo } from "@/types/api";
import { cn } from "@/lib/utils";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 필터
  const [statusFilter, setStatusFilter] = useState<"ALL" | ProductStatus>("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | ProductType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  // 상품 목록 조회
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("size", "20");

      if (statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }
      if (typeFilter !== "ALL") {
        params.set("productType", typeFilter);
      }
      if (searchQuery.trim()) {
        params.set("name", searchQuery.trim());
      }

      const response = await fetch(`/api/products?${params.toString()}`);
      const data: ApiResponse<PageResponse<ProductResponse>> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "상품 목록 조회에 실패했습니다.");
      }

      setProducts(data.data?.content || []);
      setPageInfo(data.data?.pageInfo || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "상품 목록 조회에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, typeFilter, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 검색
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchProducts();
  };

  // 엑셀 다운로드
  const handleExcelDownload = async () => {
    try {
      // 현재 필터 조건으로 전체 데이터 조회
      const params = new URLSearchParams();
      params.set("page", "0");
      params.set("size", "10000"); // 최대값

      if (statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }
      if (typeFilter !== "ALL") {
        params.set("productType", typeFilter);
      }
      if (searchQuery.trim()) {
        params.set("name", searchQuery.trim());
      }

      const response = await fetch(`/api/products?${params.toString()}`);
      const data: ApiResponse<PageResponse<ProductResponse>> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("데이터 조회에 실패했습니다.");
      }

      const allProducts = data.data?.content || [];

      // CSV 생성
      const headers = [
        "ID",
        "상품명",
        "유형",
        "상태",
        "공연장",
        "공연 시작일",
        "공연 종료일",
        "판매 시작일",
        "판매 종료일",
        "총 좌석",
        "잔여 좌석",
        "판매자 ID",
        "등록일",
      ];

      const rows = allProducts.map((p) => [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        PRODUCT_TYPE_LABELS[p.productType],
        PRODUCT_STATUS_LABELS[p.status],
        `"${p.artHallName.replace(/"/g, '""')}"`,
        new Date(p.startAt).toLocaleDateString("ko-KR"),
        new Date(p.endAt).toLocaleDateString("ko-KR"),
        new Date(p.saleStartAt).toLocaleDateString("ko-KR"),
        new Date(p.saleEndAt).toLocaleDateString("ko-KR"),
        p.totalSeats,
        p.availableSeats,
        p.sellerId,
        new Date(p.createdAt).toLocaleDateString("ko-KR"),
      ]);

      const csvContent =
          "\uFEFF" + // BOM for Korean
          headers.join(",") +
          "\n" +
          rows.map((row) => row.join(",")).join("\n");

      // 다운로드
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `상품목록_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      alert(err instanceof Error ? err.message : "엑셀 다운로드에 실패했습니다.");
    }
  };

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
            <div className="text-xs text-gray-500">{item.artHallName}</div>
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
      key: "startAt",
      label: "공연일",
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
      label: "좌석",
      render: (item) => (
          <div className="text-sm">
            <span className="font-medium">{item.availableSeats.toLocaleString()}</span>
            <span className="text-gray-500"> / {item.totalSeats.toLocaleString()}</span>
          </div>
      ),
    },
    {
      key: "sellerId",
      label: "판매자",
      render: (item) => (
          <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">
          {item.sellerId.slice(0, 8)}...
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "등록일",
      render: (item) => new Date(item.createdAt).toLocaleDateString("ko-KR"),
    },
  ];

  // 통계
  const stats = {
    total: pageInfo?.totalElements || products.length,
    pending: products.filter((p) => p.status === "PENDING").length,
    onSale: products.filter((p) => p.status === "ON_SALE").length,
    closed: products.filter((p) => ["CLOSED", "COMPLETED"].includes(p.status)).length,
  };

  return (
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">상품 목록</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              등록된 모든 상품을 조회합니다.
            </p>
          </div>
          <button
              onClick={handleExcelDownload}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            엑셀 다운로드
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
        )}

        {/* 통계 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-sm text-gray-500">전체</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-sm text-gray-500">심사 대기</p>
            <p className="text-2xl font-bold text-yellow-500 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-sm text-gray-500">판매중</p>
            <p className="text-2xl font-bold text-green-500 mt-1">{stats.onSale}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-sm text-gray-500">종료</p>
            <p className="text-2xl font-bold text-gray-400 mt-1">{stats.closed}</p>
          </div>
        </div>

        {/* 필터 & 검색 */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 상태 필터 */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm text-gray-500 py-1.5">상태:</span>
            {[
              { value: "ALL", label: "전체" },
              { value: "PENDING", label: "심사대기" },
              { value: "APPROVED", label: "승인됨" },
              { value: "SCHEDULED", label: "예매예정" },
              { value: "ON_SALE", label: "판매중" },
              { value: "CLOSED", label: "판매종료" },
              { value: "COMPLETED", label: "행사종료" },
            ].map((filter) => (
                <button
                    key={filter.value}
                    onClick={() => {
                      setStatusFilter(filter.value as "ALL" | ProductStatus);
                      setCurrentPage(0);
                    }}
                    className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                        statusFilter === filter.value
                            ? "bg-purple-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                    )}
                >
                  {filter.label}
                </button>
            ))}
          </div>

          {/* 유형 필터 */}
          <div className="flex gap-2">
            <span className="text-sm text-gray-500 py-1.5">유형:</span>
            {[
              { value: "ALL", label: "전체" },
              { value: "CONCERT", label: "콘서트" },
              { value: "MUSICAL", label: "뮤지컬" },
              { value: "PLAY", label: "연극" },
              { value: "SPORTS", label: "스포츠" },
            ].map((filter) => (
                <button
                    key={filter.value}
                    onClick={() => {
                      setTypeFilter(filter.value as "ALL" | ProductType);
                      setCurrentPage(0);
                    }}
                    className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                        typeFilter === filter.value
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                    )}
                >
                  {filter.label}
                </button>
            ))}
          </div>

          {/* 검색 */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md ml-auto">
            <div className="relative">
              <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                  type="text"
                  placeholder="상품명으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </form>
        </div>

        {/* 테이블 */}
        <DataTable
            columns={columns}
            data={products}
            keyField="id"
            onRowClick={(item) => router.push(`/admin/products/${item.id}`)}
            isLoading={isLoading}
            emptyMessage="등록된 상품이 없습니다."
        />

        {/* 페이지네이션 */}
        {pageInfo && pageInfo.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
              >
                이전
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400">
            {currentPage + 1} / {pageInfo.totalPages}
          </span>
              <button
                  onClick={() => setCurrentPage((p) => Math.min(pageInfo.totalPages - 1, p + 1))}
                  disabled={currentPage >= pageInfo.totalPages - 1}
                  className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
              >
                다음
              </button>
            </div>
        )}
      </div>
  );
}