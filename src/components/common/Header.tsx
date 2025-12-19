"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserType } from "@/types/auth";
import { CATEGORIES } from "@/types/product";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import SearchBar from "./SearchBar";
import NotificationBell from "./NotificationBell";
import UserDropdown from "./UserDropdown";
import MobileSidebar from "./MobileSidebar";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  userType: UserType;
  /** 배너 높이 (스크롤 기준점, 기본값 400px) */
  bannerHeight?: number;
  /** 스크롤 감지 없이 항상 스크롤된 상태로 표시 (mypage 등) */
  forceScrolled?: boolean;
}

const headerConfig: Record<
    UserType,
    {
      logo: string;
      loginPath: string;
      homePath: string;
    }
> = {
  CUSTOMER: {
    logo: "/images/logo-customer.png",
    loginPath: "/login",
    homePath: "/",
  },
  SELLER: {
    logo: "/images/logo-customer.png",
    loginPath: "/seller/login",
    homePath: "/seller",
  },
  ADMIN: {
    logo: "/images/logo-customer.png",
    loginPath: "/admin/login",
    homePath: "/admin",
  },
};

// 스크롤 위치 계산 함수 (컴포넌트 외부)
const getScrollState = (bannerHeight: number): boolean => {
  if (typeof window === "undefined") return false;
  const scrollThreshold = bannerHeight * 0.8;
  return window.scrollY > scrollThreshold;
};

export default function Header({ userType, bannerHeight = 400, forceScrolled = false }: HeaderProps) {
  const config = headerConfig[userType];
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // forceScrolled가 true면 항상 true, 아니면 스크롤 위치 기반
  const [scrolled, setScrolled] = useState(() => 
    forceScrolled || getScrollState(bannerHeight)
  );

  const isCustomer = userType === "CUSTOMER";

  // 스크롤 핸들러
  const handleScroll = useCallback(() => {
    const scrollThreshold = bannerHeight * 0.8;
    setScrolled(window.scrollY > scrollThreshold);
  }, [bannerHeight]);

  // 스크롤 이벤트 리스너 (forceScrolled가 false일 때만)
  useEffect(() => {
    if (forceScrolled) return;

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [forceScrolled, handleScroll]);

  // 최종 스크롤 상태: forceScrolled가 true면 항상 true
  const isScrolled = forceScrolled || scrolled;

  return (
      <>
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 w-full",
                "transition-colors duration-300",
                "border-b",
                isScrolled
                    ? "bg-white dark:bg-black border-gray-200 dark:border-gray-800 shadow-sm"
                    : "bg-transparent border-transparent"
            )}
        >
          <div className="max-w-[1400px] mx-auto px-4">
            <div className="flex items-center h-16 gap-4">
              {/* 좌측: 햄버거 메뉴 + 로고 */}
              <div className="flex items-center gap-2">
                {/* 햄버거 버튼 */}
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className={cn(
                        "w-10 h-10 rounded-lg",
                        "flex items-center justify-center",
                        "transition-colors duration-200",
                        isScrolled
                            ? "text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                            : "text-white hover:bg-white/10"
                    )}
                    aria-label="메뉴 열기"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>

                {/* 로고 이미지 */}
                <Link href={config.homePath} className="flex items-center">
                  <Image
                      src={config.logo}
                      alt="Tickatch"
                      width={120}
                      height={40}
                      className={cn(
                          "h-8 w-auto transition-all duration-300",
                          // 배너 위 (투명 배경): 흰색으로 변환
                          !isScrolled && "brightness-0 invert",
                          // 스크롤 후 다크모드: 흰색으로 변환
                          isScrolled && "dark:brightness-0 dark:invert"
                      )}
                      priority
                  />
                </Link>
              </div>

              {/* 중앙: 카테고리 네비게이션 (Customer만, 데스크탑) */}
              {isCustomer && (
                  <nav className="hidden lg:flex items-center gap-1 ml-8">
                    {CATEGORIES.map((category) => (
                        <Link
                            key={category.type}
                            href={category.href}
                            className={cn(
                                "px-4 py-2 rounded-lg",
                                "text-sm font-medium",
                                "transition-all duration-200",
                                isScrolled
                                    ? "text-gray-700 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                    : "text-white/90 hover:text-white hover:bg-white/10"
                            )}
                        >
                          {category.label}
                        </Link>
                    ))}
                  </nav>
              )}

              {/* 우측: 검색 + 다크모드 + 알림 + 로그인 */}
              <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                {/* 검색창 (Customer만) */}
                {isCustomer && <SearchBar isScrolled={isScrolled} />}

                {/* 다크모드 토글 */}
                <ThemeToggle isScrolled={isScrolled} />

                {/* 알림 버튼 (로그인 시) */}
                {isAuthenticated && <NotificationBell isScrolled={isScrolled} />}

                {/* 사용자 드롭다운 / 로그인 링크 */}
                <UserDropdown loginPath={config.loginPath} isScrolled={isScrolled} />
              </div>
            </div>
          </div>
        </header>

        {/* 모바일 사이드바 */}
        <MobileSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
        />
      </>
  );
}
