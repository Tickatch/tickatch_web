"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { StatCard, DataTable, Column } from "@/components/dashboard";
import { ProductResponse, PRODUCT_STATUS_LABELS, getStatusColor } from "@/types/product";
import { cn } from "@/lib/utils";

// 아이콘
const Icons = {
  Products: () => (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
  ),
  Ticket: () => (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
  ),
  Currency: () => (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
  ),
  Clock: () => (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
  ),
};

interface DashboardStats {
  totalProducts: number;
  onSaleProducts: number;
  totalReservations: number;
  totalRevenue: number;
  pendingProducts: number;
}

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    onSaleProducts: 0,
    totalReservations: 0,
    totalRevenue: 0,
    pendingProducts: 0,
  });
  const [recentProducts, setRecentProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sellerId, setSellerId] = useState<string | null>(null);

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

  // 대시보드 데이터 가져오기
  useEffect(() => {
    if (!sellerId) return;

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // 내 상품 목록 조회
        const productsResponse = await fetch(`/api/products?sellerId=${sellerId}&size=100`);

        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          const products: ProductResponse[] = productsData.data?.content || productsData.content || [];

          // 통계 계산
          const totalProducts = products.length;
          const onSaleProducts = products.filter((p) => p.status === "ON_SALE").length;
          const pendingProducts = products.filter((p) => p.status === "PENDING").length;

          // 총 예매 건수 및 매출 (판매된 좌석 기준)
          let totalReservations = 0;
          let totalRevenue = 0;

          products.forEach((p) => {
            const soldSeats = p.totalSeats - p.availableSeats;
            totalReservations += soldSeats;
            // 매출은 실제 API에서 가져와야 하지만, 임시로 평균 가격 계산
            if (p.seatGrades && p.seatGrades.length > 0) {
              const avgPrice = p.seatGrades.reduce((sum, g) => sum + g.price, 0) / p.seatGrades.length;
              totalRevenue += soldSeats * avgPrice;
            }
          });

          setStats({
            totalProducts,
            onSaleProducts,
            totalReservations,
            totalRevenue,
            pendingProducts,
          });

          // 최근 상품 5개
          setRecentProducts(products.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [sellerId]);

  const productColumns: Column<ProductResponse>[] = [
    {
      key: "name",
      label: "상품명",
      render: (item) => (
          <div className="max-w-xs truncate font-medium">{item.name}</div>
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
      key: "availableSeats",
      label: "잔여/전체",
      render: (item) => (
          <span className="text-gray-600 dark:text-gray-400">
          {item.availableSeats} / {item.totalSeats}
        </span>
      ),
    },
    {
      key: "startAt",
      label: "시작일",
      render: (item) => new Date(item.startAt).toLocaleDateString("ko-KR"),
    },
    {
      key: "viewCount",
      label: "조회수",
      render: (item) => item.viewCount.toLocaleString(),
    },
  ];

  return (
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              대시보드
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {user?.nickname || user?.email}님, 환영합니다!
            </p>
          </div>
          <Link
              href="/seller/products/new"
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 상품 등록
          </Link>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
              title="등록 상품"
              value={stats.totalProducts}
              icon={<Icons.Products />}
              color="blue"
          />
          <StatCard
              title="판매중 상품"
              value={stats.onSaleProducts}
              icon={<Icons.Products />}
              color="green"
          />
          <StatCard
              title="총 예매 건수"
              value={stats.totalReservations}
              icon={<Icons.Ticket />}
              color="purple"
          />
          <StatCard
              title="총 매출"
              value={stats.totalRevenue > 100000000
                  ? `${(stats.totalRevenue / 100000000).toFixed(1)}억`
                  : `${(stats.totalRevenue / 10000).toLocaleString()}만`}
              icon={<Icons.Currency />}
              color="orange"
          />
        </div>

        {/* 알림 배너 */}
        {stats.pendingProducts > 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-center gap-3">
              <div className="text-yellow-600 dark:text-yellow-400">
                <Icons.Clock />
              </div>
              <div className="flex-1">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  심사 대기 중인 상품이 {stats.pendingProducts}개 있습니다.
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  관리자 승인 후 판매가 시작됩니다.
                </p>
              </div>
              <Link
                  href="/seller/products?status=PENDING"
                  className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/60 transition-colors"
              >
                확인하기
              </Link>
            </div>
        )}

        {/* 최근 상품 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              최근 상품
            </h2>
            <Link
                href="/seller/products"
                className="text-sm text-emerald-500 hover:text-emerald-600 font-medium"
            >
              전체보기 →
            </Link>
          </div>
          <DataTable
              columns={productColumns}
              data={recentProducts}
              keyField="id"
              onRowClick={(item) => window.location.href = `/seller/products/${item.id}`}
              isLoading={isLoading}
              emptyMessage="등록된 상품이 없습니다."
          />
        </div>
      </div>
  );
}