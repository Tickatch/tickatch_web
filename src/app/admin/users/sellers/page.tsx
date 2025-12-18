"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable, Column } from "@/components/dashboard";
import {
  SellerResponse,
  UserStatus,
  UserStatusLabel,
  SellerStatus,
  SellerStatusLabel,
} from "@/types/user";
import { ApiResponse, PageResponse, PageInfo } from "@/types/api";
import { cn } from "@/lib/utils";

// 상태 색상
function getUserStatusColor(status: UserStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "SUSPENDED":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "WITHDRAWN":
      return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getSellerStatusColor(status: SellerStatus): string {
  switch (status) {
    case "APPROVED":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "REJECTED":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<SellerResponse[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 필터
  const [statusFilter, setStatusFilter] = useState<"ALL" | UserStatus>("ALL");
  const [sellerStatusFilter, setSellerStatusFilter] = useState<"ALL" | SellerStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  // 판매자 목록 조회
  const fetchSellers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("size", "20");

      if (statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }
      if (sellerStatusFilter !== "ALL") {
        params.set("sellerStatus", sellerStatusFilter);
      }
      if (searchQuery.trim()) {
        params.set("email", searchQuery.trim());
      }

      const response = await fetch(`/api/user/sellers?${params.toString()}`);
      const data: ApiResponse<PageResponse<SellerResponse>> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "판매자 목록 조회에 실패했습니다.");
      }

      setSellers(data.data?.content || []);
      setPageInfo(data.data?.pageInfo || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "판매자 목록 조회에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, sellerStatusFilter, searchQuery]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  // 상태 변경
  const handleStatusChange = async (sellerId: string, newStatus: UserStatus) => {
    const confirmed = confirm(`회원 상태를 "${UserStatusLabel[newStatus]}"(으)로 변경하시겠습니까?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/user/sellers/${sellerId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "상태 변경에 실패했습니다.");
      }

      alert("상태가 변경되었습니다.");
      fetchSellers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "상태 변경에 실패했습니다.");
    }
  };

  // 판매자 승인
  const handleApprove = async (sellerId: string) => {
    const confirmed = confirm("이 판매자를 승인하시겠습니까?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/user/sellers/${sellerId}/approve`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "승인에 실패했습니다.");
      }

      alert("판매자가 승인되었습니다.");
      fetchSellers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "승인에 실패했습니다.");
    }
  };

  // 판매자 거절
  const handleReject = async (sellerId: string) => {
    const reason = prompt("거절 사유를 입력해주세요:");
    if (!reason) return;

    try {
      const response = await fetch(`/api/user/sellers/${sellerId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "거절에 실패했습니다.");
      }

      alert("판매자가 거절되었습니다.");
      fetchSellers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "거절에 실패했습니다.");
    }
  };

  // 검색
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchSellers();
  };

  const columns: Column<SellerResponse>[] = [
    {
      key: "email",
      label: "판매자 정보",
      render: (item) => (
          <div>
            <div className="font-medium">{item.email}</div>
            <div className="text-xs text-gray-500">{item.name} ({item.businessName})</div>
          </div>
      ),
    },
    {
      key: "businessNumber",
      label: "사업자번호",
      render: (item) => (
          <span className="font-mono text-sm">{item.formattedBusinessNumber}</span>
      ),
    },
    {
      key: "sellerStatus",
      label: "판매자 상태",
      render: (item) => (
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getSellerStatusColor(item.sellerStatus))}>
          {SellerStatusLabel[item.sellerStatus]}
        </span>
      ),
    },
    {
      key: "status",
      label: "계정 상태",
      render: (item) => (
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getUserStatusColor(item.status))}>
          {UserStatusLabel[item.status]}
        </span>
      ),
    },
    {
      key: "hasSettlementInfo",
      label: "정산정보",
      render: (item) => (
          <span className={cn(
              "px-2 py-1 rounded text-xs",
              item.hasSettlementInfo
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800"
          )}>
          {item.hasSettlementInfo ? "등록됨" : "미등록"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "가입일",
      render: (item) => new Date(item.createdAt).toLocaleDateString("ko-KR"),
    },
    {
      key: "actions",
      label: "",
      render: (item) => (
          <div className="flex items-center gap-2">
            {/* 판매자 승인/거절 */}
            {item.sellerStatus === "PENDING" && (
                <>
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(item.id);
                      }}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded hover:bg-blue-200"
                  >
                    승인
                  </button>
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(item.id);
                      }}
                      className="px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded hover:bg-red-200"
                  >
                    거절
                  </button>
                </>
            )}
            {/* 계정 잠금/해제 */}
            {item.status === "ACTIVE" && (
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(item.id, "SUSPENDED");
                    }}
                    className="px-2 py-1 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded hover:bg-orange-200"
                >
                  정지
                </button>
            )}
            {item.status === "SUSPENDED" && (
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(item.id, "ACTIVE");
                    }}
                    className="px-2 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded hover:bg-green-200"
                >
                  해제
                </button>
            )}
          </div>
      ),
    },
  ];

  // 통계
  const stats = {
    total: pageInfo?.totalElements || sellers.length,
    pending: sellers.filter((s) => s.sellerStatus === "PENDING").length,
    approved: sellers.filter((s) => s.sellerStatus === "APPROVED").length,
    active: sellers.filter((s) => s.status === "ACTIVE").length,
    suspended: sellers.filter((s) => s.status === "SUSPENDED").length,
  };

  return (
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            판매자 관리
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            등록된 판매자 계정을 관리합니다.
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
        )}

        {/* 통계 */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-sm text-gray-500">전체</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-sm text-gray-500">승인 대기</p>
            <p className="text-2xl font-bold text-yellow-500 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-sm text-gray-500">승인 완료</p>
            <p className="text-2xl font-bold text-blue-500 mt-1">{stats.approved}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-sm text-gray-500">활성</p>
            <p className="text-2xl font-bold text-green-500 mt-1">{stats.active}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-sm text-gray-500">정지</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{stats.suspended}</p>
          </div>
        </div>

        {/* 필터 & 검색 */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 판매자 상태 필터 */}
          <div className="flex gap-2">
            <span className="text-sm text-gray-500 py-1.5">판매자:</span>
            {[
              { value: "ALL", label: "전체" },
              { value: "PENDING", label: "승인대기" },
              { value: "APPROVED", label: "승인완료" },
              { value: "REJECTED", label: "거절" },
            ].map((filter) => (
                <button
                    key={filter.value}
                    onClick={() => {
                      setSellerStatusFilter(filter.value as "ALL" | SellerStatus);
                      setCurrentPage(0);
                    }}
                    className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                        sellerStatusFilter === filter.value
                            ? "bg-purple-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                    )}
                >
                  {filter.label}
                </button>
            ))}
          </div>

          {/* 계정 상태 필터 */}
          <div className="flex gap-2">
            <span className="text-sm text-gray-500 py-1.5">계정:</span>
            {[
              { value: "ALL", label: "전체" },
              { value: "ACTIVE", label: "활성" },
              { value: "SUSPENDED", label: "정지" },
              { value: "WITHDRAWN", label: "탈퇴" },
            ].map((filter) => (
                <button
                    key={filter.value}
                    onClick={() => {
                      setStatusFilter(filter.value as "ALL" | UserStatus);
                      setCurrentPage(0);
                    }}
                    className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                        statusFilter === filter.value
                            ? "bg-blue-500 text-white"
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
                  placeholder="이메일로 검색..."
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
            data={sellers}
            keyField="id"
            isLoading={isLoading}
            emptyMessage="등록된 판매자가 없습니다."
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