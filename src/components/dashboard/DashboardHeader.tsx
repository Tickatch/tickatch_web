"use client";

import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/common/ThemeToggle";

interface DashboardHeaderProps {
  sidebarCollapsed?: boolean;
}

export default function DashboardHeader({ sidebarCollapsed = false }: DashboardHeaderProps) {
  const { user, logout } = useAuth();

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

          {/* 오른쪽: 사용자 정보 & 로그아웃 */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            {user && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.nickname || user.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white font-semibold text-sm">
                    {(user.nickname || user.email || "U")[0].toUpperCase()}
                  </div>
                </div>
            )}

            <button
                onClick={logout}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>
  );
}