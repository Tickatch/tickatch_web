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

// 더미 상품 목록
const DUMMY_PRODUCTS: ProductResponse[] = [
  {
    id: 1,
    name: "2025 아이유 콘서트 - HER",
    productType: "CONCERT",
    status: "ON_SALE",
    startAt: "2025-03-15T18:00:00",
    endAt: "2025-03-17T21:00:00",
    saleStartAt: "2025-02-01T10:00:00",
    saleEndAt: "2025-03-14T23:59:59",
    runningTime: 150,
    stageId: 1,
    stageName: "메인홀",
    artHallId: 1,
    artHallName: "올림픽공원 KSPO DOME",
    artHallAddress: "서울특별시 송파구 올림픽로 424",
    ageRating: "ALL",
    maxTicketsPerPerson: 4,
    idVerificationRequired: true,
    transferable: false,
    admissionMinutesBefore: 30,
    lateEntryAllowed: false,
    hasIntermission: true,
    intermissionMinutes: 20,
    photographyAllowed: false,
    foodAllowed: false,
    cancellable: true,
    cancelDeadlineDays: 7,
    totalSeats: 800,
    availableSeats: 360,
    viewCount: 15420,
    sellerId: "seller-001",
    createdAt: "2025-01-15T10:00:00",
    updatedAt: "2025-02-20T15:30:00",
  },
  {
    id: 2,
    name: "레미제라블 - 10주년 기념 공연",
    productType: "MUSICAL",
    status: "SCHEDULED",
    startAt: "2025-04-01T19:00:00",
    endAt: "2025-06-30T21:30:00",
    saleStartAt: "2025-03-01T10:00:00",
    saleEndAt: "2025-06-29T23:59:59",
    runningTime: 170,
    stageId: 2,
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
    intermissionMinutes: 15,
    photographyAllowed: false,
    foodAllowed: false,
    cancellable: true,
    cancelDeadlineDays: 3,
    totalSeats: 1200,
    availableSeats: 1200,
    viewCount: 8920,
    sellerId: "seller-001",
    createdAt: "2025-02-01T09:00:00",
    updatedAt: "2025-02-15T11:20:00",
  },
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
    viewCount: 3200,
    sellerId: "seller-001",
    createdAt: "2025-02-20T14:00:00",
    updatedAt: "2025-02-20T14:00:00",
  },
  {
    id: 4,
    name: "햄릿 - 2025 신작",
    productType: "PLAY",
    status: "DRAFT",
    startAt: "2025-05-01T19:30:00",
    endAt: "2025-05-31T21:30:00",
    saleStartAt: "2025-04-15T10:00:00",
    saleEndAt: "2025-05-30T23:59:59",
    runningTime: 120,
    stageId: 4,
    stageName: "소극장",
    artHallId: 4,
    artHallName: "예술의전당",
    artHallAddress: "서울특별시 서초구 남부순환로 2406",
    ageRating: "FIFTEEN",
    maxTicketsPerPerson: 2,
    idVerificationRequired: false,
    transferable: false,
    admissionMinutesBefore: 20,
    lateEntryAllowed: false,
    hasIntermission: true,
    intermissionMinutes: 10,
    photographyAllowed: false,
    foodAllowed: false,
    cancellable: true,
    cancelDeadlineDays: 5,
    totalSeats: 300,
    availableSeats: 300,
    viewCount: 0,
    sellerId: "seller-001",
    createdAt: "2025-02-22T16:00:00",
    updatedAt: "2025-02-22T16:00:00",
  },
];

const statusFilters: { value: ProductStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "DRAFT", label: "임시저장" },
  { value: "PENDING", label: "심사대기" },
  { value: "APPROVED", label: "승인됨" },
  { value: "REJECTED", label: "반려됨" },
  { value: "SCHEDULED", label: "예매예정" },
  { value: "ON_SALE", label: "판매중" },
  { value: "CLOSED", label: "판매종료" },
  { value: "COMPLETED", label: "행사종료" },
  { value: "CANCELLED", label: "취소됨" },
];

export default function SellerProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || "ALL";

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // TODO: 실제 API 호출
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        let filtered = DUMMY_PRODUCTS;
        if (statusFilter !== "ALL") {
          filtered = filtered.filter((p) => p.status === statusFilter);
        }
        setProducts(filtered);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [statusFilter]);

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
      render: (item) => (
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
                  style={{
                    width: `${((item.totalSeats - item.availableSeats) / item.totalSeats) * 100}%`,
                  }}
              />
            </div>
          </div>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-24",
      render: (item) => (
          <div className="flex items-center gap-2">
            <Link
                href={`/seller/products/${item.id}`}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
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
              상품 목록
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              등록된 상품을 관리하세요.
            </p>
          </div>
          <Link
              href="/seller/products/new"
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-rose-600 transition-colors flex items-center gap-2"
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
            {statusFilters.slice(0, 7).map((filter) => (
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
                            ? "bg-orange-500 text-white"
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
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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