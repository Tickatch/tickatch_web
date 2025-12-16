"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable, Column } from "@/components/dashboard";
import { ReservationDetailResponse, RESERVATION_STATUS_LABELS, getReservationStatusColor } from "@/types/reservation";
import { cn } from "@/lib/utils";

// 더미 예매 목록
const DUMMY_RESERVATIONS: (ReservationDetailResponse & { productName: string; customerEmail: string })[] = [
  {
    id: "res-001",
    reserverId: "cust-001",
    reserverName: "홍길동",
    productId: 1,
    productName: "2025 아이유 콘서트 - HER",
    seatId: 101,
    seatNumber: "A열 15번",
    price: 154000,
    status: "CONFIRMED",
    customerEmail: "hong@email.com",
  },
  {
    id: "res-002",
    reserverId: "cust-002",
    reserverName: "김철수",
    productId: 1,
    productName: "2025 아이유 콘서트 - HER",
    seatId: 102,
    seatNumber: "A열 16번",
    price: 154000,
    status: "CONFIRMED",
    customerEmail: "kim@email.com",
  },
  {
    id: "res-003",
    reserverId: "cust-003",
    reserverName: "이영희",
    productId: 2,
    productName: "레미제라블 - 10주년 기념 공연",
    seatId: 201,
    seatNumber: "B열 10번",
    price: 121000,
    status: "PENDING_PAYMENT",
    customerEmail: "lee@email.com",
  },
  {
    id: "res-004",
    reserverId: "cust-004",
    reserverName: "박민수",
    productId: 1,
    productName: "2025 아이유 콘서트 - HER",
    seatId: 103,
    seatNumber: "VIP석 5번",
    price: 199000,
    status: "CANCELED",
    customerEmail: "park@email.com",
  },
  {
    id: "res-005",
    reserverId: "cust-005",
    reserverName: "정수진",
    productId: 2,
    productName: "레미제라블 - 10주년 기념 공연",
    seatId: 202,
    seatNumber: "S석 22번",
    price: 99000,
    status: "CONFIRMED",
    customerEmail: "jung@email.com",
  },
];

export default function SellerReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<typeof DUMMY_RESERVATIONS>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // TODO: 실제 API 호출
    const fetchReservations = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setReservations(DUMMY_RESERVATIONS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const filteredReservations = reservations.filter((r) => {
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchesSearch =
        r.reserverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.seatNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const columns: Column<typeof DUMMY_RESERVATIONS[0]>[] = [
    {
      key: "id",
      label: "예매번호",
      render: (item) => (
          <span className="font-mono text-xs">{item.id}</span>
      ),
    },
    {
      key: "productName",
      label: "상품명",
      render: (item) => (
          <div className="max-w-xs truncate font-medium">{item.productName}</div>
      ),
    },
    {
      key: "reserverName",
      label: "예매자",
      render: (item) => (
          <div>
            <div className="font-medium">{item.reserverName}</div>
            <div className="text-xs text-gray-500">{item.customerEmail}</div>
          </div>
      ),
    },
    {
      key: "seatNumber",
      label: "좌석",
    },
    {
      key: "price",
      label: "금액",
      render: (item) => (
          <span>{item.price.toLocaleString()}원</span>
      ),
    },
    {
      key: "status",
      label: "상태",
      render: (item) => (
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getReservationStatusColor(item.status))}>
          {RESERVATION_STATUS_LABELS[item.status]}
        </span>
      ),
    },
  ];

  // 통계 계산
  const stats = {
    total: reservations.length,
    confirmed: reservations.filter((r) => r.status === "CONFIRMED").length,
    pending: reservations.filter((r) => r.status === "PENDING_PAYMENT").length,
    canceled: reservations.filter((r) => r.status === "CANCELED" || r.status === "EXPIRED").length,
    totalRevenue: reservations
    .filter((r) => r.status === "CONFIRMED")
    .reduce((sum, r) => sum + r.price, 0),
  };

  return (
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            예매 현황
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            내 상품의 예매 현황을 확인합니다.
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-sm text-gray-500">총 예매</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-sm text-gray-500">확정</p>
            <p className="text-2xl font-bold text-green-500 mt-1">{stats.confirmed}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-sm text-gray-500">결제 대기</p>
            <p className="text-2xl font-bold text-yellow-500 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-sm text-gray-500">확정 매출</p>
            <p className="text-2xl font-bold text-blue-500 mt-1">
              {(stats.totalRevenue / 10000).toLocaleString()}만원
            </p>
          </div>
        </div>

        {/* 필터 & 검색 */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 상태 필터 */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: "ALL", label: "전체" },
              { value: "CONFIRMED", label: "확정" },
              { value: "PENDING_PAYMENT", label: "결제 대기" },
              { value: "CANCELED", label: "취소" },
            ].map((filter) => (
                <button
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value)}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                  type="text"
                  placeholder="예매자, 상품명, 좌석 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* 예매 테이블 */}
        <DataTable
            columns={columns}
            data={filteredReservations}
            keyField="id"
            onRowClick={(item) => router.push(`/seller/reservations/${item.id}`)}
            isLoading={isLoading}
            emptyMessage="예매 내역이 없습니다."
        />
      </div>
  );
}