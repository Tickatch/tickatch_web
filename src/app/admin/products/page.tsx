"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

// 더미 상품 목록
const DUMMY_PRODUCTS: ProductResponse[] = [
  {
    id: 3,
    name: "2025 프로야구 개막전",
    productType: "SPORTS",
    status: "PENDING",
    startAt: "2025-03-29T14:00:00",
    endAt: "2025-03-29T17:00:00",
    saleStartAt: "2025-03-15T10:00:00",
    saleEndAt: "2025-03-28T23:59:59",
    runningTime: 180,
    stageId: 3,
    stageName: "메인 구장",
    artHallId: 3,
    artHallName: "고척스카이돔",
    artHallAddress: "서울특별시 구로구 경인로 430",
    ageRating: "ALL",
    maxTicketsPerPerson: 4,
    idVerificationRequired: false,
    transferable: true,
    admissionMinutesBefore: 60,
    lateEntryAllowed: true,
    hasIntermission: false,
    intermissionMinutes: 0,
    photographyAllowed: true,
    foodAllowed: true,
    cancellable: true,
    cancelDeadlineDays: 1,
    totalSeats: 16000,
    availableSeats: 16000,
    viewCount: 0,
    sellerId: "seller-001",
    createdAt: "2025-02-20T14:00:00",
    updatedAt: "2025-02-20T14:00:00",
  },
  {
    id: 5,
    name: "2025 BTS 월드투어 서울",
    productType: "CONCERT",
    status: "PENDING",
    startAt: "2025-06-01T18:00:00",
    endAt: "2025-06-03T21:00:00",
    saleStartAt: "2025-04-01T10:00:00",
    saleEndAt: "2025-05-31T23:59:59",
    runningTime: 180,
    stageId: 1,
    stageName: "메인홀",
    artHallId: 1,
    artHallName: "올림픽공원 KSPO DOME",
    artHallAddress: "서울특별시 송파구 올림픽로 424",
    ageRating: "ALL",
    maxTicketsPerPerson: 2,
    idVerificationRequired: true,
    transferable: false,
    admissionMinutesBefore: 60,
    lateEntryAllowed: false,
    hasIntermission: false,
    intermissionMinutes: 0,
    photographyAllowed: false,
    foodAllowed: false,
    cancellable: true,
    cancelDeadlineDays: 7,
    totalSeats: 15000,
    availableSeats: 15000,
    viewCount: 0,
    sellerId: "seller-002",
    createdAt: "2025-02-22T09:00:00",
    updatedAt: "2025-02-22T09:00:00",
  },
  {
    id: 6,
    name: "오페라의 유령 - 25주년 기념",
    productType: "MUSICAL",
    status: "PENDING",
    startAt: "2025-05-15T19:30:00",
    endAt: "2025-08-15T21:30:00",
    saleStartAt: "2025-04-15T10:00:00",
    saleEndAt: "2025-08-14T23:59:59",
    runningTime: 150,
    stageId: 3,
    stageName: "대극장",
    artHallId: 2,
    artHallName: "블루스퀘어",
    artHallAddress: "서울특별시 용산구 이태원로 294",
    ageRating: "TWELVE",
    maxTicketsPerPerson: 4,
    idVerificationRequired: false,
    transferable: true,
    admissionMinutesBefore: 30,
    lateEntryAllowed: false,
    hasIntermission: true,
    intermissionMinutes: 20,
    photographyAllowed: false,
    foodAllowed: false,
    cancellable: true,
    cancelDeadlineDays: 3,
    totalSeats: 1500,
    availableSeats: 1500,
    viewCount: 0,
    sellerId: "seller-003",
    createdAt: "2025-02-23T11:00:00",
    updatedAt: "2025-02-23T11:00:00",
  },
  {
    id: 7,
    name: "연극 - 햄릿 2025",
    productType: "PLAY",
    status: "APPROVED",
    startAt: "2025-04-01T19:00:00",
    endAt: "2025-04-30T21:00:00",
    saleStartAt: "2025-03-15T10:00:00",
    saleEndAt: "2025-04-29T23:59:59",
    runningTime: 120,
    stageId: 7,
    stageName: "토월극장",
    artHallId: 4,
    artHallName: "예술의전당",
    artHallAddress: "서울특별시 서초구 남부순환로 2406",
    ageRating: "FIFTEEN",
    maxTicketsPerPerson: 4,
    idVerificationRequired: false,
    transferable: true,
    admissionMinutesBefore: 20,
    lateEntryAllowed: false,
    hasIntermission: true,
    intermissionMinutes: 15,
    photographyAllowed: false,
    foodAllowed: false,
    cancellable: true,
    cancelDeadlineDays: 3,
    totalSeats: 500,
    availableSeats: 500,
    viewCount: 0,
    sellerId: "seller-004",
    createdAt: "2025-02-24T10:00:00",
    updatedAt: "2025-02-25T09:00:00",
  },
];

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | ProductStatus>("PENDING");
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    // TODO: 실제 API 호출
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setProducts(DUMMY_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleApprove = async (productId: number) => {
    const confirmed = confirm("이 상품을 승인하시겠습니까?");
    if (!confirmed) return;

    try {
      // TODO: 실제 API 호출
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, status: "APPROVED" as ProductStatus } : p))
      );
      alert("상품이 승인되었습니다.");
    } catch (error) {
      alert("승인에 실패했습니다.");
    }
  };

  const handleReject = async () => {
    if (!selectedProduct) return;
    if (!rejectReason.trim()) {
      alert("반려 사유를 입력해주세요.");
      return;
    }

    try {
      // TODO: 실제 API 호출
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProducts((prev) =>
          prev.map((p) => (p.id === selectedProduct.id ? { ...p, status: "REJECTED" as ProductStatus } : p))
      );
      setShowRejectModal(false);
      setSelectedProduct(null);
      setRejectReason("");
      alert("상품이 반려되었습니다.");
    } catch (error) {
      alert("반려에 실패했습니다.");
    }
  };

  const filteredProducts = products.filter((p) => {
    if (statusFilter === "ALL") return true;
    return p.status === statusFilter;
  });

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
      key: "sellerId",
      label: "판매자",
      render: (item) => (
          <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">
          {item.sellerId}
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
      key: "createdAt",
      label: "등록일",
      render: (item) => new Date(item.createdAt).toLocaleDateString("ko-KR"),
    },
    {
      key: "actions",
      label: "",
      render: (item) => (
          <div className="flex items-center gap-2">
            {item.status === "PENDING" && (
                <>
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(item.id);
                      }}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50"
                  >
                    승인
                  </button>
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(item);
                        setShowRejectModal(true);
                      }}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                  >
                    반려
                  </button>
                </>
            )}
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

  // 통계
  const stats = {
    pending: products.filter((p) => p.status === "PENDING").length,
    approved: products.filter((p) => p.status === "APPROVED").length,
    rejected: products.filter((p) => p.status === "REJECTED").length,
  };

  return (
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            상품 심사
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            판매자가 등록한 상품을 심사합니다.
          </p>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4 text-center">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">심사 대기</p>
            <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-4 text-center">
            <p className="text-sm text-green-600 dark:text-green-400">승인됨</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-300 mt-1">{stats.approved}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">반려됨</p>
            <p className="text-3xl font-bold text-red-700 dark:text-red-300 mt-1">{stats.rejected}</p>
          </div>
        </div>

        {/* 필터 */}
        <div className="flex gap-2">
          {[
            { value: "PENDING", label: "심사 대기" },
            { value: "APPROVED", label: "승인됨" },
            { value: "REJECTED", label: "반려됨" },
            { value: "ALL", label: "전체" },
          ].map((filter) => (
              <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value as "ALL" | ProductStatus)}
                  className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      statusFilter === filter.value
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                  )}
              >
                {filter.label}
              </button>
          ))}
        </div>

        {/* 테이블 */}
        <DataTable
            columns={columns}
            data={filteredProducts}
            keyField="id"
            onRowClick={(item) => router.push(`/admin/products/${item.id}`)}
            isLoading={isLoading}
            emptyMessage="상품이 없습니다."
        />

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
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    반려하기
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}