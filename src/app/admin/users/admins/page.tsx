"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable, Column } from "@/components/dashboard";
import {
  AdminResponse,
  UserStatus,
  UserStatusLabel,
  AdminRole,
  AdminRoleLabel,
  CreateAdminRequest,
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

function getAdminRoleColor(role: AdminRole): string {
  switch (role) {
    case "ADMIN":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "MANAGER":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<AdminResponse[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 필터
  const [statusFilter, setStatusFilter] = useState<"ALL" | UserStatus>("ALL");
  const [roleFilter, setRoleFilter] = useState<"ALL" | AdminRole>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  // 생성 모달
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateAdminRequest>({
    email: "",
    name: "",
    phone: "",
    department: "",
    adminRole: "MANAGER",
  });
  const [isCreating, setIsCreating] = useState(false);

  // 관리자 목록 조회
  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("size", "20");

      if (statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }
      if (roleFilter !== "ALL") {
        params.set("adminRole", roleFilter);
      }
      if (searchQuery.trim()) {
        params.set("email", searchQuery.trim());
      }

      const response = await fetch(`/api/user/admins?${params.toString()}`);
      const data: ApiResponse<PageResponse<AdminResponse>> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "관리자 목록 조회에 실패했습니다.");
      }

      setAdmins(data.data?.content || []);
      setPageInfo(data.data?.pageInfo || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "관리자 목록 조회에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, roleFilter, searchQuery]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // 관리자 생성
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.email || !createForm.name) {
      alert("이메일과 이름은 필수입니다.");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/api/user/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "관리자 생성에 실패했습니다.");
      }

      alert("관리자가 생성되었습니다.\n초기 비밀번호는 이메일로 발송됩니다.");
      setShowCreateModal(false);
      setCreateForm({
        email: "",
        name: "",
        phone: "",
        department: "",
        adminRole: "MANAGER",
      });
      fetchAdmins();
    } catch (err) {
      alert(err instanceof Error ? err.message : "관리자 생성에 실패했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  // 상태 변경
  const handleStatusChange = async (adminId: string, newStatus: UserStatus) => {
    const confirmed = confirm(`회원 상태를 "${UserStatusLabel[newStatus]}"(으)로 변경하시겠습니까?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/user/admins/${adminId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "상태 변경에 실패했습니다.");
      }

      alert("상태가 변경되었습니다.");
      fetchAdmins();
    } catch (err) {
      alert(err instanceof Error ? err.message : "상태 변경에 실패했습니다.");
    }
  };

  // 역할 변경
  const handleRoleChange = async (adminId: string, newRole: AdminRole) => {
    const confirmed = confirm(`관리자 역할을 "${AdminRoleLabel[newRole]}"(으)로 변경하시겠습니까?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/user/admins/${adminId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminRole: newRole }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "역할 변경에 실패했습니다.");
      }

      alert("역할이 변경되었습니다.");
      fetchAdmins();
    } catch (err) {
      alert(err instanceof Error ? err.message : "역할 변경에 실패했습니다.");
    }
  };

  // 검색
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchAdmins();
  };

  const columns: Column<AdminResponse>[] = [
    {
      key: "email",
      label: "관리자 정보",
      render: (item) => (
          <div>
            <div className="font-medium">{item.email}</div>
            <div className="text-xs text-gray-500">{item.name}</div>
          </div>
      ),
    },
    {
      key: "department",
      label: "부서",
      render: (item) => (
          <span className="text-gray-600 dark:text-gray-400">
          {item.department || "-"}
        </span>
      ),
    },
    {
      key: "phone",
      label: "연락처",
      render: (item) => (
          <span className="text-gray-600 dark:text-gray-400">
          {item.phone || "-"}
        </span>
      ),
    },
    {
      key: "adminRole",
      label: "역할",
      render: (item) => (
          <div className="flex items-center gap-2">
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getAdminRoleColor(item.adminRole))}>
            {AdminRoleLabel[item.adminRole]}
          </span>
            <select
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleRoleChange(item.id, e.target.value as AdminRole)}
                value={item.adminRole}
                className="text-xs bg-transparent border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5"
            >
              <option value="MANAGER">일반 관리자</option>
              <option value="ADMIN">최고 관리자</option>
            </select>
          </div>
      ),
    },
    {
      key: "status",
      label: "상태",
      render: (item) => (
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getUserStatusColor(item.status))}>
          {UserStatusLabel[item.status]}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "생성일",
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
                      handleStatusChange(item.id, "SUSPENDED");
                    }}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded hover:bg-red-200"
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
    total: pageInfo?.totalElements || admins.length,
    active: admins.filter((a) => a.status === "ACTIVE").length,
    suspended: admins.filter((a) => a.status === "SUSPENDED").length,
    superAdmin: admins.filter((a) => a.adminRole === "ADMIN").length,
    manager: admins.filter((a) => a.adminRole === "MANAGER").length,
  };

  return (
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              관리자 관리
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              시스템 관리자 계정을 관리합니다.
            </p>
          </div>
          <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            관리자 추가
          </button>
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
            <p className="text-sm text-gray-500">활성</p>
            <p className="text-2xl font-bold text-green-500 mt-1">{stats.active}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-sm text-gray-500">정지</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{stats.suspended}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-sm text-gray-500">최고 관리자</p>
            <p className="text-2xl font-bold text-purple-500 mt-1">{stats.superAdmin}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-sm text-gray-500">일반 관리자</p>
            <p className="text-2xl font-bold text-blue-500 mt-1">{stats.manager}</p>
          </div>
        </div>

        {/* 필터 & 검색 */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 상태 필터 */}
          <div className="flex gap-2">
            <span className="text-sm text-gray-500 py-1.5">상태:</span>
            {[
              { value: "ALL", label: "전체" },
              { value: "ACTIVE", label: "활성" },
              { value: "SUSPENDED", label: "정지" },
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
                            ? "bg-purple-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                    )}
                >
                  {filter.label}
                </button>
            ))}
          </div>

          {/* 역할 필터 */}
          <div className="flex gap-2">
            <span className="text-sm text-gray-500 py-1.5">역할:</span>
            {[
              { value: "ALL", label: "전체" },
              { value: "ADMIN", label: "최고 관리자" },
              { value: "MANAGER", label: "일반 관리자" },
            ].map((filter) => (
                <button
                    key={filter.value}
                    onClick={() => {
                      setRoleFilter(filter.value as "ALL" | AdminRole);
                      setCurrentPage(0);
                    }}
                    className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                        roleFilter === filter.value
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
            data={admins}
            keyField="id"
            isLoading={isLoading}
            emptyMessage="등록된 관리자가 없습니다."
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

        {/* 관리자 생성 모달 */}
        {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  새 관리자 추가
                </h3>

                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      이메일 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={createForm.email}
                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                        placeholder="admin@tickatch.com"
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={createForm.name}
                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                        placeholder="홍길동"
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      연락처
                    </label>
                    <input
                        type="tel"
                        value={createForm.phone || ""}
                        onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                        placeholder="010-1234-5678"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      부서
                    </label>
                    <input
                        type="text"
                        value={createForm.department || ""}
                        onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                        placeholder="운영팀"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      역할 <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={createForm.adminRole}
                        onChange={(e) => setCreateForm({ ...createForm, adminRole: e.target.value as AdminRole })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="MANAGER">일반 관리자</option>
                      <option value="ADMIN">최고 관리자</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      취소
                    </button>
                    <button
                        type="submit"
                        disabled={isCreating}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                    >
                      {isCreating ? "생성 중..." : "관리자 추가"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}