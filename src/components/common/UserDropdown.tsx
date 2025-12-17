"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface UserDropdownProps {
  loginPath?: string;
  isScrolled?: boolean;
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  {
    label: "마이페이지",
    href: "/mypage",
    icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
    ),
  },
  {
    label: "예매 내역",
    href: "/mypage/reservations",
    icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
          />
        </svg>
    ),
  },
  {
    label: "찜 목록",
    href: "/mypage/wishlist",
    icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
    ),
  },
  {
    label: "설정",
    href: "/mypage/settings",
    icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
    ),
  },
];

export default function UserDropdown({
                                       loginPath = "/login",
                                       isScrolled = true
                                     }: UserDropdownProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  if (isLoading) {
    return (
        <div className={cn(
            "w-8 h-8 rounded-full animate-pulse",
            isScrolled ? "bg-gray-200 dark:bg-gray-700" : "bg-white/20"
        )} />
    );
  }

  // 비로그인 상태: 밑줄 있는 텍스트 링크
  if (!isAuthenticated || !user) {
    return (
        <Link
            href={loginPath}
            className={cn(
                "text-sm font-medium",
                "underline underline-offset-4 decoration-1",
                "transition-colors duration-200",
                isScrolled
                    ? "text-gray-700 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 hover:decoration-orange-500 dark:hover:decoration-orange-400"
                    : "text-white/90 hover:text-white hover:decoration-white"
            )}
        >
          로그인
        </Link>
    );
  }

  // 로그인 상태: 사용자 아이콘 드롭다운
  const userInitial = user.nickname?.charAt(0) || user.email?.charAt(0) || "U";

  return (
      <div ref={containerRef} className="relative">
        <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
                "w-9 h-9 rounded-full",
                "bg-gradient-to-br from-orange-400 to-rose-500",
                "flex items-center justify-center",
                "text-white text-sm font-semibold",
                "ring-2 ring-transparent",
                "transition-all duration-200",
                isScrolled
                    ? "hover:ring-orange-300 dark:hover:ring-orange-500/50"
                    : "hover:ring-white/50",
                isOpen && (isScrolled ? "ring-orange-400 dark:ring-orange-500" : "ring-white/50")
            )}
            aria-expanded={isOpen}
            aria-label="사용자 메뉴"
        >
          {userInitial.toUpperCase()}
        </button>

        {isOpen && (
            <div
                className={cn(
                    "absolute right-0 top-12 w-64",
                    "bg-white dark:bg-gray-900",
                    "rounded-xl shadow-2xl",
                    "border border-gray-200 dark:border-gray-700",
                    "z-50 overflow-hidden",
                    "animate-in fade-in slide-in-from-top-2 duration-200"
                )}
            >
              {/* 사용자 정보 */}
              <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div
                      className={cn(
                          "w-10 h-10 rounded-full",
                          "bg-gradient-to-br from-orange-400 to-rose-500",
                          "flex items-center justify-center",
                          "text-white font-semibold"
                      )}
                  >
                    {userInitial.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.nickname || user.email}
                    </p>
                    {user.nickname && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 메뉴 목록 */}
              <div className="py-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                            "w-full px-4 py-2.5",
                            "flex items-center gap-3",
                            "text-sm text-gray-700 dark:text-gray-200",
                            "hover:bg-gray-50 dark:hover:bg-gray-800",
                            "hover:text-orange-500 dark:hover:text-orange-400",
                            "transition-colors"
                        )}
                    >
                <span className="text-gray-400 dark:text-gray-500">
                  {item.icon}
                </span>
                      {item.label}
                    </Link>
                ))}
              </div>

              {/* 로그아웃 버튼 */}
              <div className="border-t border-gray-100 dark:border-gray-800 py-2">
                <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className={cn(
                        "w-full px-4 py-2.5",
                        "flex items-center gap-3",
                        "text-sm text-gray-700 dark:text-gray-200",
                        "hover:bg-red-50 dark:hover:bg-red-900/20",
                        "hover:text-red-600 dark:hover:text-red-400",
                        "transition-colors"
                    )}
                >
                  <svg
                      className="w-4 h-4 text-gray-400 dark:text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  로그아웃
                </button>
              </div>
            </div>
        )}
      </div>
  );
}