"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StatCard, DataTable, Column } from "@/components/dashboard";
import { ProductResponse, PRODUCT_STATUS_LABELS, getStatusColor } from "@/types/product";
import { cn } from "@/lib/utils";

// 더미 통계
const DUMMY_STATS = {
  totalProducts: 12,
  onSaleProducts: 8,
  totalReservations: 1234,
  totalRevenue: 185420000,
  todayReservations: 45,
  pendingProducts: 2,
};

// 더미 최근 상품
const DUMMY_RECENT_PRODUCTS: ProductResponse[] = [
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
];

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

export default function SellerDashboardPage() {
  const [stats, setStats] = useState(DUMMY_STATS);
  const [recentProducts, setRecentProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: 실제 API 호출
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 더미 데이터 사용
        await new Promise((resolve) => setTimeout(resolve, 500));
        setStats(DUMMY_STATS);
        setRecentProducts(DUMMY_RECENT_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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
              판매 현황을 한눈에 확인하세요.
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
              change={{ value: 12, label: "지난달 대비" }}
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
              change={{ value: 8, label: "지난주 대비" }}
              icon={<Icons.Ticket />}
              color="purple"
          />
          <StatCard
              title="총 매출"
              value={`${(stats.totalRevenue / 100000000).toFixed(1)}억`}
              change={{ value: 15, label: "지난달 대비" }}
              icon={<Icons.Currency />}
              color="orange"
          />
        </div>

        {/* 알림 배너 */}
        {stats.pendingProducts > 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-center gap-3">
              <Icons.Clock />
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