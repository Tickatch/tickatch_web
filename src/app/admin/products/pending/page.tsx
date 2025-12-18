"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataTable, Column } from "@/components/dashboard";
import {
  ProductResponse,
  PRODUCT_STATUS_LABELS,
  PRODUCT_TYPE_LABELS,
  getStatusColor,
  getProductTypeColor,
} from "@/types/product";
import { ApiResponse, PageResponse, PageInfo } from "@/types/api";
import { cn } from "@/lib/utils";

export default function AdminProductsPendingPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // 반려 모달
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // 심사 대기 상품 목록 조회
  const fetchPendingProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("size", "20");
      params.set("status", "PENDING");

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
  }, [currentPage]);

  useEffect(() => {
    fetchPendingProducts();
  }, [fetchPendingProducts]);

  // 상품 승인
  const handleApprove = async (productId: number) => {
    const confirmed = confirm("이 상품을 승인하시겠습니까?");
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/products/${productId}/approve`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "승인에 실패했습니다.");
      }

      alert("상품이 승인되었습니다.");
      fetchPendingProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "승인에 실패했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 상품 반려
  const handleReject = async () => {
    if (!selectedProduct) return;
    if (!rejectReason.trim()) {
      alert("반려 사유를 입력해주세요.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/products/${selectedProduct.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "반려에 실패했습니다.");
      }

      alert("상품이 반려되었습니다.");
      setShowRejectModal(false);
      setSelectedProduct(null);
      setRejectReason("");
      fetchPendingProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "반려에 실패했습니다.");
    } finally {
      setIsProcessing(false);
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
    {
      key: "actions",
      label: "",
      render: (item) => (
          <div className="flex items-center gap-2">
            <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprove(item.id);
                }}
                disabled={isProcessing}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-50"
            >
              승인
            </button>
            <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProduct(item);
                  setShowRejectModal(true);
                }}
                disabled={isProcessing}
                className="px-3 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50"
            >
              반려
            </button>
            <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/admin/products/${item.id}`);
                }}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              상세
            </button>
          </div>
      ),
    },
  ];

  const pendingCount = pageInfo?.totalElements || products.length;

  return (
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">상품 심사</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            판매자가 등록한 상품을 심사합니다.
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
        )}

        {/* 알림 배너 */}
        {pendingCount > 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-center gap-3">
              <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  심사 대기 중인 상품이 {pendingCount}개 있습니다.
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  빠른 심사로 판매자의 판매를 도와주세요.
                </p>
              </div>
            </div>
        )}

        {/* 통계 */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-6 text-center">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">심사 대기</p>
          <p className="text-4xl font-bold text-yellow-700 dark:text-yellow-300 mt-2">{pendingCount}</p>
        </div>

        {/* 테이블 */}
        <DataTable
            columns={columns}
            data={products}
            keyField="id"
            onRowClick={(item) => router.push(`/admin/products/${item.id}`)}
            isLoading={isLoading}
            emptyMessage="심사 대기 중인 상품이 없습니다."
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

        {/* 반려 모달 */}
        {showRejectModal && selectedProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  상품 반려
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedProduct.name}
              </span>
                  을(를) 반려합니다.
                </p>
                <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="반려 사유를 입력해주세요..."
                    rows={4}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button
                      onClick={() => {
                        setShowRejectModal(false);
                        setSelectedProduct(null);
                        setRejectReason("");
                      }}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    취소
                  </button>
                  <button
                      onClick={handleReject}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? "처리 중..." : "반려하기"}
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}