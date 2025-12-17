"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/common/ThemeToggle";

interface DashboardHeaderProps {
  sidebarCollapsed?: boolean;
}

// 아이콘
const BellIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const UserIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const SettingsIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const LogoutIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

// 역할별 설정
const ROLE_CONFIG = {
  ADMIN: {
    label: "관리자",
    mypagePath: "/admin/mypage",
    settingsPath: "/admin/settings",
    accentColor: "from-purple-400 to-indigo-500",
    accentRing: "hover:ring-purple-300 dark:hover:ring-purple-500/50",
  },
  SELLER: {
    label: "판매자",
    mypagePath: "/seller/mypage",
    settingsPath: "/seller/settings",
    accentColor: "from-emerald-400 to-teal-500",
    accentRing: "hover:ring-emerald-300 dark:hover:ring-emerald-500/50",
  },
};

// 역할별 알림 (TODO: 실제 API 연동)
const getNotifications = (role: "ADMIN" | "SELLER") => {
  if (role === "ADMIN") {
    return [
      { id: 1, message: "새로운 상품 심사 요청이 있습니다.", time: "방금 전", read: false, link: "/admin/products/pending" },
      { id: 2, message: "판매자 가입 승인 대기 중입니다.", time: "5분 전", read: false, link: "/admin/users/sellers" },
      { id: 3, message: "시스템 점검이 예정되어 있습니다.", time: "1시간 전", read: true, link: "/admin/settings" },
    ];
  } else {
    return [
      { id: 1, message: "상품이 승인되었습니다.", time: "방금 전", read: false, link: "/seller/products" },
      { id: 2, message: "새로운 예매가 완료되었습니다.", time: "10분 전", read: false, link: "/seller/reservations" },
      { id: 3, message: "정산 내역이 업데이트되었습니다.", time: "2시간 전", read: true, link: "/seller/analytics" },
    ];
  }
};

export default function DashboardHeader({ sidebarCollapsed = false }: DashboardHeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // 현재 역할 (경로 기반)
  const currentRole: "ADMIN" | "SELLER" = pathname.startsWith("/admin") ? "ADMIN" : "SELLER";
  const config = ROLE_CONFIG[currentRole];
  const notifications = getNotifications(currentRole);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    };

    if (showUserMenu || showNotifications) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showUserMenu, showNotifications]);

  const userInitial = user?.nickname?.charAt(0) || user?.email?.charAt(0) || (currentRole === "ADMIN" ? "A" : "S");

  return (
      <header
          className={cn(
              "fixed top-0 right-0 z-30 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-all duration-300",
              sidebarCollapsed ? "left-16" : "left-64"
          )}
      >
        <div className="flex items-center justify-between h-full px-6">
          {/* 왼쪽: 빈 공간 또는 breadcrumb */}
          <div />

          {/* 오른쪽: 알림, 테마, 사용자 메뉴 */}
          <div className="flex items-center gap-3">
            {/* 알림 */}
            <div className="relative" ref={notificationRef}>
              <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
                  className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <BellIcon />
                {unreadCount > 0 && (
                    <span className={cn(
                        "absolute top-1 right-1 w-4 h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center",
                        currentRole === "ADMIN" ? "bg-purple-500" : "bg-emerald-500"
                    )}>
                  {unreadCount}
                </span>
                )}
              </button>

              {/* 알림 드롭다운 */}
              {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">알림</span>
                      {unreadCount > 0 && (
                          <span className={cn(
                              "text-xs",
                              currentRole === "ADMIN" ? "text-purple-500" : "text-emerald-500"
                          )}>
                      {unreadCount}개의 새 알림
                    </span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500">
                            알림이 없습니다.
                          </div>
                      ) : (
                          notifications.map((notification) => (
                              <Link
                                  key={notification.id}
                                  href={notification.link}
                                  onClick={() => setShowNotifications(false)}
                                  className={cn(
                                      "block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-b-0",
                                      !notification.read && (currentRole === "ADMIN"
                                              ? "bg-purple-50/50 dark:bg-purple-900/10"
                                              : "bg-emerald-50/50 dark:bg-emerald-900/10"
                                      )
                                  )}
                              >
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                              </Link>
                          ))
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <button className={cn(
                          "text-sm w-full text-center",
                          currentRole === "ADMIN"
                              ? "text-purple-500 hover:text-purple-600"
                              : "text-emerald-500 hover:text-emerald-600"
                      )}>
                        모든 알림 보기
                      </button>
                    </div>
                  </div>
              )}
            </div>

            {/* 테마 토글 */}
            <ThemeToggle />

            {/* 구분선 */}
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

            {/* 사용자 메뉴 */}
            <div className="relative" ref={userMenuRef}>
              <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className={cn(
                      "flex items-center gap-3 p-1.5 rounded-lg transition-colors",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      showUserMenu && "bg-gray-100 dark:bg-gray-800"
                  )}
              >
                {user && (
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.nickname || user.email}
                      </p>
                      <p className={cn(
                          "text-xs",
                          currentRole === "ADMIN" ? "text-purple-500" : "text-emerald-500"
                      )}>
                        {config.label}
                      </p>
                    </div>
                )}
                <div className={cn(
                    "w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-semibold text-sm ring-2 ring-transparent transition-all",
                    config.accentColor,
                    config.accentRing
                )}>
                  {userInitial.toUpperCase()}
                </div>
              </button>

              {/* 사용자 드롭다운 */}
              {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
                    {/* 사용자 정보 */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-semibold",
                            config.accentColor
                        )}>
                          {userInitial.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user?.nickname || user?.email || config.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user?.email || `${config.label} 계정`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 메뉴 */}
                    <div className="py-1">
                      <Link
                          href={config.mypagePath}
                          onClick={() => setShowUserMenu(false)}
                          className={cn(
                              "w-full px-4 py-2.5 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                              currentRole === "ADMIN"
                                  ? "hover:text-purple-500 dark:hover:text-purple-400"
                                  : "hover:text-emerald-500 dark:hover:text-emerald-400"
                          )}
                      >
                    <span className="text-gray-400 dark:text-gray-500">
                      <UserIcon />
                    </span>
                        마이페이지
                      </Link>
                      <Link
                          href={config.settingsPath}
                          onClick={() => setShowUserMenu(false)}
                          className={cn(
                              "w-full px-4 py-2.5 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                              currentRole === "ADMIN"
                                  ? "hover:text-purple-500 dark:hover:text-purple-400"
                                  : "hover:text-emerald-500 dark:hover:text-emerald-400"
                          )}
                      >
                    <span className="text-gray-400 dark:text-gray-500">
                      <SettingsIcon />
                    </span>
                        설정
                      </Link>
                    </div>

                    {/* 로그아웃 */}
                    <div className="border-t border-gray-100 dark:border-gray-800 py-1">
                      <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                    <span className="text-gray-400 dark:text-gray-500">
                      <LogoutIcon />
                    </span>
                        로그아웃
                      </button>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </header>
  );
}