"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { DashboardSidebar, DashboardHeader, SidebarGroup } from "@/components/dashboard";

// 인증 불필요 페이지 (로그인, 회원가입, 비밀번호 찾기)
const PUBLIC_PATHS = ["/seller/login", "/seller/signup", "/seller/forgot-password"];

// 아이콘 컴포넌트
const Icons = {
  Dashboard: () => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
  ),
  Products: () => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
  ),
  Ticket: () => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
  ),
  Plus: () => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
  ),
  Chart: () => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
  ),
  Settings: () => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
  ),
  Logo: () => (
      <svg className="w-8 h-8 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
  ),
};

const sidebarGroups: SidebarGroup[] = [
  {
    title: "대시보드",
    items: [
      { label: "홈", href: "/seller", icon: <Icons.Dashboard /> },
      { label: "매출 통계", href: "/seller/analytics", icon: <Icons.Chart /> },
    ],
  },
  {
    title: "상품 관리",
    items: [
      { label: "상품 목록", href: "/seller/products", icon: <Icons.Products /> },
      { label: "상품 등록", href: "/seller/products/new", icon: <Icons.Plus /> },
    ],
  },
  {
    title: "예매 관리",
    items: [
      { label: "예매 현황", href: "/seller/reservations", icon: <Icons.Ticket /> },
    ],
  },
  {
    title: "설정",
    items: [
      { label: "계정 설정", href: "/seller/settings", icon: <Icons.Settings /> },
    ],
  },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, userType } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 공개 페이지인지 확인
  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  // 인증 체크 (공개 페이지 제외, 로딩 완료 후)
  useEffect(() => {
    if (isPublicPage || isLoading) return;

    if (!isAuthenticated) {
      router.push("/seller/login");
    } else if (userType !== "SELLER") {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, userType, router, isPublicPage]);

  // 공개 페이지는 레이아웃 없이 렌더링
  if (isPublicPage) {
    return <>{children}</>;
  }

  // 로딩 중이거나 인증 안됨
  if (isLoading || !isAuthenticated || userType !== "SELLER") {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <DashboardSidebar
            groups={sidebarGroups}
            title="Tickatch 판매자"
            titleHref="/seller"
            logoIcon={<Icons.Logo />}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
        />
        <DashboardHeader sidebarCollapsed={sidebarCollapsed} />
        <main
            className={`pt-16 transition-all duration-300 ${
                sidebarCollapsed ? "ml-16" : "ml-64"
            }`}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
  );
}