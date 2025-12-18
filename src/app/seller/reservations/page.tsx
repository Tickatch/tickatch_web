"use client";

import { useState, useEffect } from "react";
import { DataTable, Column } from "@/components/dashboard";
import { ProductResponse } from "@/types/product";
import { ReservationDetailResponse, RESERVATION_STATUS_LABELS, getReservationStatusColor } from "@/types/reservation";
import { cn } from "@/lib/utils";


export default function SellerReservationsPage() {
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [reservations, setReservations] = useState<ReservationDetailResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [productFilter, setProductFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // 판매자 정보 가져오기
  useEffect(() => {
    const fetchSellerInfo = async () => {
      try {
        const response = await fetch("/api/user/sellers/me");
        if (response.ok) {
          const data = await response.json();
          setSellerId(data.data?.id || data.id);
        }
      } catch (error) {
        console.error("Failed to fetch seller info:", error);
      }
    };
    fetchSellerInfo();
  }, []);

  // 상품 및 예매 데이터 가져오기
  useEffect(() => {
    if (!sellerId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. 내 상품 목록 조회
        const productsResponse = await fetch(`/api/products?sellerId=${sellerId}&size=100`);

        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          const myProducts: ProductResponse[] = productsData.data?.content || productsData.content || [];
          setProducts(myProducts);

          // 2. 각 상품별 예매 좌석 조회 (실제 구현에서는 예매 API 사용)
          // TODO: 실제 예매 데이터는 예매 API에서 가져와야 함
          // 현재는 상품 정보 기반으로 더미 데이터 생성
          const allReservations: ReservationDetailResponse[] = [];

          for (const product of myProducts) {
            const soldSeats = product.totalSeats - product.availableSeats;

            // 더미 예매 데이터 생성 (실제로는 API 호출)
            for (let i = 0; i < Math.min(soldSeats, 5); i++) {
              const reservation: ReservationDetailResponse = {
                id: `res-${product.id}-${i}`,
                reserverId: `cust-${i}`,
                reserverName: `고객${i + 1}`,
                productId: product.id,
                productName: product.name,
                seatId: i + 1,
                seatNumber: `A${i + 1}`,
                price: product.seatGrades?.[0]?.price ?? 50000,
                status: i === 0 ? "CONFIRMED" : i === 1 ? "PENDING_PAYMENT" : "CONFIRMED",
                reservationNumber: `RES-${product.id}-${i + 1}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              allReservations.push(reservation);
            }
          }

          setReservations(allReservations);
        }
      } catch (error) {
        console.error("Failed to fetch reservations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [sellerId]);

  // 필터링된 예매 목록
  const filteredReservations = reservations.filter((r) => {
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchesProduct = productFilter === "ALL" || r.productId.toString() === productFilter;
    const matchesSearch =
        r.reserverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.seatNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesProduct && matchesSearch;
  });

  // 통계 계산
  const stats = {
    total: reservations.length,
    confirmed: reservations.filter((r) => r.status === "CONFIRMED").length,
    pending: reservations.filter((r) => r.status === "PENDING_PAYMENT").length,
    canceled: reservations.filter((r) => r.status === "CANCELED" || r.status === "EXPIRED").length,
    totalRevenue: reservations
      .filter((r) => r.status === "CONFIRMED")
      .reduce((sum, r) => sum + (r.price ?? 0), 0),
  };

  const columns: Column<ReservationDetailResponse>[] = [
    {
      key: "id",
      label: "예매번호",
      render: (item) => (
          <span className="font-mono text-xs">{item.reservationNumber}</span>
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
    },
    {
      key: "seatNumber",
      label: "좌석",
    },
    {
      key: "price",
      label: "금액",
      render: (item) => (
          <span>{(item.price ?? 0).toLocaleString()}원</span>
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
            <p className="text-sm text-gray-500">취소/만료</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{stats.canceled}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-emerald-200 dark:border-emerald-800 p-4">
            <p className="text-sm text-emerald-600 dark:text-emerald-400">확정 매출</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {(stats.totalRevenue / 10000).toLocaleString()}만원
            </p>
          </div>
        </div>

        {/* 필터 & 검색 */}
        <div className="flex flex-col md:flex-row gap-4">
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
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                >
                  {filter.label}
                </button>
            ))}
          </div>

          {/* 상품 필터 */}
          <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">전체 상품</option>
            {products.map((product) => (
                <option key={product.id} value={product.id.toString()}>
                  {product.name}
                </option>
            ))}
          </select>

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
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* 예매 테이블 */}
        <DataTable
            columns={columns}
            data={filteredReservations}
            keyField="id"
            isLoading={isLoading}
            emptyMessage="예매 내역이 없습니다."
        />
      </div>
  );
}
