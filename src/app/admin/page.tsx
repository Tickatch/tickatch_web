"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StatCard, DataTable, Column } from "@/components/dashboard";
import { ProductResponse, PRODUCT_STATUS_LABELS, getStatusColor, getProductTypeColor, PRODUCT_TYPE_LABELS } from "@/types/product";
import { ApiResponse, PageResponse } from "@/types/api";
import { cn } from "@/lib/utils";

// 아이콘
const Icons = {
  Building: () => (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
  ),
  Products: () => (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
  ),
  Users: () => (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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
  pendingProducts: number;
  onSaleProducts: number;
  totalSellers: number;
  totalCustomers: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    pendingProducts: 0,
    onSaleProducts: 0,
    totalSellers: 0,
    totalCustomers: 0,
  });
  const [pendingProducts, setPendingProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 심사 대기 상품 조회
        const pendingRes = await fetch("/api/products?status=PENDING&size=5");
        const pendingData: ApiResponse<PageResponse<ProductResponse>> = await pendingRes.json();

        if (pendingRes.ok && pendingData.success) {
          setPendingProducts(pendingData.data?.content || []);
          setStats(prev => ({
            ...prev,
            pendingProducts: pendingData.data?.pageInfo?.totalElements || 0,
          }));
        }

        // 전체 상품 수 조회
        const allProductsRes = await fetch("/api/products?size=1");
        const allProductsData: ApiResponse<PageResponse<ProductResponse>> = await allProductsRes.json();
        if (allProductsRes.ok && allProductsData.success) {
          setStats(prev => ({
            ...prev,
            totalProducts: allProductsData.data?.pageInfo?.totalElements || 0,
          }));
        }

        // 판매중 상품 수 조회
        const onSaleRes = await fetch("/api/products?status=ON_SALE&size=1");
        const onSaleData: ApiResponse<PageResponse<ProductResponse>> = await onSaleRes.json();
        if (onSaleRes.ok && onSaleData.success) {
          setStats(prev => ({
            ...prev,
            onSaleProducts: onSaleData.data?.pageInfo?.totalElements || 0,
          }));
        }

        // 판매자 수 조회
        const sellersRes = await fetch("/api/user/sellers?size=1");
        const sellersData = await sellersRes.json();
        if (sellersRes.ok && sellersData.success) {
          setStats(prev => ({
            ...prev,
            totalSellers: sellersData.data?.pageInfo?.totalElements || 0,
          }));
        }

        // 구매자 수 조회
        const customersRes = await fetch("/api/user/customers?size=1");
        const customersData = await customersRes.json();
        if (customersRes.ok && customersData.success) {
          setStats(prev => ({
            ...prev,
            totalCustomers: customersData.data?.pageInfo?.totalElements || 0,
          }));
        }
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
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
          <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">{item.sellerId.slice(0, 8)}...</span>
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
          <Link
              href={`/admin/products/${item.id}`}
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50"
          >
            심사하기
          </Link>
      ),
    },
  ];

  return (
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            관리자 대시보드
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            시스템 현황을 확인하고 관리하세요.
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
              title="전체 상품"
              value={stats.totalProducts}
              icon={<Icons.Products />}
              color="blue"
          />
          <StatCard
              title="판매중"
              value={stats.onSaleProducts}
              icon={<Icons.Products />}
              color="green"
          />
          <StatCard
              title="심사 대기"
              value={stats.pendingProducts}
              icon={<Icons.Clock />}
              color="orange"
          />
          <StatCard
              title="총 회원 수"
              value={stats.totalSellers + stats.totalCustomers}
              icon={<Icons.Users />}
              color="purple"
          />
        </div>

        {/* 알림 배너 */}
        {stats.pendingProducts > 0 && (
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl flex items-center gap-3">
              <Icons.Clock />
              <div className="flex-1">
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  심사 대기 중인 상품이 {stats.pendingProducts}개 있습니다.
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  빠른 심사로 판매자의 판매를 도와주세요.
                </p>
              </div>
              <Link
                  href="/admin/products/pending"
                  className="px-4 py-2 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 rounded-lg text-sm font-medium hover:bg-orange-200 dark:hover:bg-orange-900/60 transition-colors"
              >
                심사하기
              </Link>
            </div>
        )}

        {/* 심사 대기 상품 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              심사 대기 상품
            </h2>
            <Link
                href="/admin/products/pending"
                className="text-sm text-purple-500 hover:text-purple-600 font-medium"
            >
              전체보기 →
            </Link>
          </div>
          <DataTable
              columns={productColumns}
              data={pendingProducts}
              keyField="id"
              onRowClick={(item) => window.location.href = `/admin/products/${item.id}`}
              isLoading={isLoading}
              emptyMessage="심사 대기 중인 상품이 없습니다."
          />
        </div>

        {/* 빠른 링크 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
              href="/admin/arthalls/new"
              className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                <Icons.Building />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">공연장 등록</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">새 공연장 추가</p>
              </div>
            </div>
          </Link>
          <Link
              href="/admin/users/sellers"
              className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-green-300 dark:hover:border-green-700 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-500 group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                <Icons.Users />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">판매자 관리</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stats.totalSellers}명의 판매자</p>
              </div>
            </div>
          </Link>
          <Link
              href="/admin/users/customers"
              className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-500 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                <Icons.Users />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">구매자 관리</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stats.totalCustomers.toLocaleString()}명의 구매자</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
  );
}