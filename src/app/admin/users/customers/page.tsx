"use client";

import { useState, useEffect } from "react";
import { DataTable, Column } from "@/components/dashboard";
import { AuthInfo, AuthStatus, AUTH_STATUS_LABELS } from "@/types/auth";
import { cn } from "@/lib/utils";

// 더미 구매자 목록
const DUMMY_CUSTOMERS: AuthInfo[] = [
  {
    id: "cust-001",
    email: "user1@gmail.com",
    userType: "CUSTOMER",
    status: "ACTIVE",
    lastLoginAt: "2025-02-25T14:30:00",
    providers: ["GOOGLE"],
    createdAt: "2025-01-10T09:00:00",
  },
  {
    id: "cust-002",
    email: "music_lover@naver.com",
    userType: "CUSTOMER",
    status: "ACTIVE",
    lastLoginAt: "2025-02-25T12:20:00",
    providers: ["NAVER"],
    createdAt: "2025-01-12T11:00:00",
  },
  {
    id: "cust-003",
    email: "concert_fan@kakao.com",
    userType: "CUSTOMER",
    status: "ACTIVE",
    lastLoginAt: "2025-02-24T09:45:00",
    providers: ["KAKAO"],
    createdAt: "2025-01-15T14:00:00",
  },
  {
    id: "cust-004",
    email: "theater_goer@email.com",
    userType: "CUSTOMER",
    status: "LOCKED",
    lastLoginAt: "2025-02-10T08:00:00",
    providers: [],
    createdAt: "2025-01-18T16:00:00",
  },
  {
    id: "cust-005",
    email: "sports_fan@email.com",
    userType: "CUSTOMER",
    status: "ACTIVE",
    lastLoginAt: "2025-02-23T18:30:00",
    providers: [],
    createdAt: "2025-01-20T10:00:00",
  },
  {
    id: "cust-006",
    email: "old_user@email.com",
    userType: "CUSTOMER",
    status: "WITHDRAWN",
    lastLoginAt: null,
    providers: [],
    createdAt: "2025-01-05T08:00:00",
  },
];

function getStatusColor(status: AuthStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "LOCKED":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "WITHDRAWN":
      return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AuthInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | AuthStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // TODO: 실제 API 호출
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setCustomers(DUMMY_CUSTOMERS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleStatusChange = async (userId: string, newStatus: AuthStatus) => {
    const confirmed = confirm(`회원 상태를 "${AUTH_STATUS_LABELS[newStatus]}"(으)로 변경하시겠습니까?`);
    if (!confirmed) return;

    try {
      // TODO: 실제 API 호출
      await new Promise((resolve) => setTimeout(resolve, 500));
      setCustomers((prev) =>
          prev.map((c) => (c.id === userId ? { ...c, status: newStatus } : c))
      );
      alert("상태가 변경되었습니다.");
    } catch (error) {
      alert("상태 변경에 실패했습니다.");
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchesSearch = c.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const columns: Column<AuthInfo>[] = [
    {
      key: "email",
      label: "이메일",
      render: (item) => (
          <div>
            <div className="font-medium">{item.email}</div>
            <div className="text-xs text-gray-500 font-mono">{item.id}</div>
          </div>
      ),
    },
    {
      key: "providers",
      label: "연동",
      render: (item) => (
          <div className="flex gap-1">
            {item.providers.length === 0 ? (
                <span className="text-gray-400 text-xs">이메일</span>
            ) : (
                item.providers.map((p) => (
                    <span
                        key={p}
                        className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded"
                    >
                {p}
              </span>
                ))
            )}
          </div>
      ),
    },
    {
      key: "status",
      label: "상태",
      render: (item) => (
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(item.status))}>
          {AUTH_STATUS_LABELS[item.status]}
        </span>
      ),
    },
    {
      key: "lastLoginAt",
      label: "최근 로그인",
      render: (item) =>
          item.lastLoginAt
              ? new Date(item.lastLoginAt).toLocaleString("ko-KR", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
              : "-",
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
            {item.status === "ACTIVE" && (
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(item.id, "LOCKED");
                    }}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded hover:bg-red-200"
                >
                  잠금
                </button>
            )}
            {item.status === "LOCKED" && (
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
    total: customers.length,
    active: customers.filter((c) => c.status === "ACTIVE").length,
    locked: customers.filter((c) => c.status === "LOCKED").length,
    withdrawn: customers.filter((c) => c.status === "WITHDRAWN").length,
  };

  return (
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            구매자 관리
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            등록된 구매자 계정을 관리합니다.
          </p>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-sm text-gray-500">전체</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-sm text-gray-500">활성</p>
            <p className="text-2xl font-bold text-green-500 mt-1">{stats.active}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-sm text-gray-500">잠금</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{stats.locked}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-sm text-gray-500">탈퇴</p>
            <p className="text-2xl font-bold text-gray-400 mt-1">{stats.withdrawn}</p>
          </div>
        </div>

        {/* 필터 & 검색 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            {[
              { value: "ALL", label: "전체" },
              { value: "ACTIVE", label: "활성" },
              { value: "LOCKED", label: "잠금" },
              { value: "WITHDRAWN", label: "탈퇴" },
            ].map((filter) => (
                <button
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value as "ALL" | AuthStatus)}
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
                  placeholder="이메일 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* 테이블 */}
        <DataTable
            columns={columns}
            data={filteredCustomers}
            keyField="id"
            isLoading={isLoading}
            emptyMessage="등록된 구매자가 없습니다."
        />
      </div>
  );
}