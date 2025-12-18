"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DataTable, Column } from "@/components/dashboard";
import { ArtHallListResponse, ART_HALL_STATUS_LABELS, getArtHallStatusColor } from "@/types/venue";
import { ApiResponse, PageResponse, PageInfo } from "@/types/api";
import { cn } from "@/lib/utils";

export default function AdminArtHallsPage() {
  const router = useRouter();
  const [artHalls, setArtHalls] = useState<ArtHallListResponse[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [currentPage, setCurrentPage] = useState(0);

  // 공연장 목록 조회
  const fetchArtHalls = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("size", "20");

      if (searchQuery.trim()) {
        params.set("keyword", searchQuery.trim());
      }

      const response = await fetch(`/api/arthalls?${params.toString()}`);
      const data: ApiResponse<PageResponse<ArtHallListResponse>> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "공연장 목록 조회에 실패했습니다.");
      }

      let filtered = data.data?.content || [];

      // 프론트에서 상태 필터링 (백엔드에 status 필터 없을 경우)
      if (statusFilter !== "ALL") {
        filtered = filtered.filter((ah) => ah.status === statusFilter);
      }

      setArtHalls(filtered);
      setPageInfo(data.data?.pageInfo || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "공연장 목록 조회에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter]);

  useEffect(() => {
    fetchArtHalls();
  }, [fetchArtHalls]);

  // 검색
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchArtHalls();
  };

  const columns: Column<ArtHallListResponse>[] = [
    {
      key: "id",
      label: "ID",
      className: "w-16",
    },
    {
      key: "name",
      label: "공연장명",
      render: (item) => <div className="font-medium">{item.name}</div>,
    },
    {
      key: "address",
      label: "주소",
      render: (item) => (
          <div className="max-w-md truncate text-gray-600 dark:text-gray-400">
            {item.address}
          </div>
      ),
    },
    {
      key: "status",
      label: "상태",
      render: (item) => (
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getArtHallStatusColor(item.status))}>
          {ART_HALL_STATUS_LABELS[item.status]}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "등록일",
      render: (item) => new Date(item.createdAt).toLocaleDateString("ko-KR"),
    },
    {
      key: "actions",
      label: "",
      className: "w-32",
      render: (item) => (
          <div className="flex items-center gap-2">
            <Link
                href={`/admin/arthalls/${item.id}`}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
              상세
            </Link>
          </div>
      ),
    },
  ];

  // 통계
  const stats = {
    total: pageInfo?.totalElements || artHalls.length,
    active: artHalls.filter((ah) => ah.status === "ACTIVE").length,
    inactive: artHalls.filter((ah) => ah.status === "INACTIVE").length,
  };

  return (
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              공연장 관리
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              등록된 공연장을 관리합니다.
            </p>
          </div>
          <Link
              href="/admin/arthalls/new"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            공연장 등록
          </Link>
        </div>

        {/* 에러 메시지 */}
        {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
        )}

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-sm text-gray-500">전체</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-sm text-gray-500">운영중</p>
            <p className="text-2xl font-bold text-green-500 mt-1">{stats.active}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-sm text-gray-500">운영중지</p>
            <p className="text-2xl font-bold text-gray-400 mt-1">{stats.inactive}</p>
          </div>
        </div>

        {/* 필터 & 검색 */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 상태 필터 */}
          <div className="flex gap-2">
            {[
              { value: "ALL", label: "전체" },
              { value: "ACTIVE", label: "운영중" },
              { value: "INACTIVE", label: "운영중지" },
            ].map((filter) => (
                <button
                    key={filter.value}
                    onClick={() => {
                      setStatusFilter(filter.value as "ALL" | "ACTIVE" | "INACTIVE");
                      setCurrentPage(0);
                    }}
                    className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                        statusFilter === filter.value
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
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
                  placeholder="공연장명 또는 주소 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>
        </div>

        {/* 공연장 테이블 */}
        <DataTable
            columns={columns}
            data={artHalls}
            keyField="id"
            onRowClick={(item) => router.push(`/admin/arthalls/${item.id}`)}
            isLoading={isLoading}
            emptyMessage="등록된 공연장이 없습니다."
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