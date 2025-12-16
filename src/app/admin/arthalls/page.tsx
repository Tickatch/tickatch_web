"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DataTable, Column } from "@/components/dashboard";
import { ArtHallListResponse, ART_HALL_STATUS_LABELS, getArtHallStatusColor } from "@/types/venue";
import { cn } from "@/lib/utils";

// 더미 공연장 목록
const DUMMY_ART_HALLS: ArtHallListResponse[] = [
  { id: 1, name: "올림픽공원 KSPO DOME", address: "서울특별시 송파구 올림픽로 424", status: "ACTIVE", createdAt: "2025-01-01T10:00:00" },
  { id: 2, name: "블루스퀘어", address: "서울특별시 용산구 이태원로 294", status: "ACTIVE", createdAt: "2025-01-02T11:00:00" },
  { id: 3, name: "고척스카이돔", address: "서울특별시 구로구 경인로 430", status: "ACTIVE", createdAt: "2025-01-03T09:00:00" },
  { id: 4, name: "예술의전당", address: "서울특별시 서초구 남부순환로 2406", status: "ACTIVE", createdAt: "2025-01-04T14:00:00" },
  { id: 5, name: "세종문화회관", address: "서울특별시 종로구 세종대로 175", status: "ACTIVE", createdAt: "2025-01-05T10:00:00" },
  { id: 6, name: "LG아트센터 서울", address: "서울특별시 강서구 마곡중앙로 136", status: "ACTIVE", createdAt: "2025-01-06T11:00:00" },
  { id: 7, name: "샤롯데씨어터", address: "서울특별시 송파구 올림픽로 300", status: "ACTIVE", createdAt: "2025-01-07T15:00:00" },
  { id: 8, name: "잠실종합운동장", address: "서울특별시 송파구 올림픽로 25", status: "INACTIVE", createdAt: "2025-01-08T09:00:00" },
];

export default function AdminArtHallsPage() {
  const router = useRouter();
  const [artHalls, setArtHalls] = useState<ArtHallListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  useEffect(() => {
    // TODO: 실제 API 호출
    const fetchArtHalls = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setArtHalls(DUMMY_ART_HALLS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtHalls();
  }, []);

  const filteredArtHalls = artHalls.filter((ah) => {
    const matchesSearch = ah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ah.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || ah.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<ArtHallListResponse>[] = [
    {
      key: "id",
      label: "ID",
      className: "w-16",
    },
    {
      key: "name",
      label: "공연장명",
      render: (item) => (
          <div className="font-medium">{item.name}</div>
      ),
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
            <Link
                href={`/admin/arthalls/${item.id}/stages`}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50"
                onClick={(e) => e.stopPropagation()}
            >
              스테이지
            </Link>
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
                    onClick={() => setStatusFilter(filter.value as "ALL" | "ACTIVE" | "INACTIVE")}
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
          <div className="flex-1 max-w-md ml-auto">
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
          </div>
        </div>

        {/* 공연장 테이블 */}
        <DataTable
            columns={columns}
            data={filteredArtHalls}
            keyField="id"
            onRowClick={(item) => router.push(`/admin/arthalls/${item.id}`)}
            isLoading={isLoading}
            emptyMessage="등록된 공연장이 없습니다."
        />
      </div>
  );
}