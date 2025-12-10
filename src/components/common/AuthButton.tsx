"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { UserType } from "@/types/auth";

interface AuthButtonProps {
  loginPath?: string;
  userType?: UserType;
}

export default function AuthButton({
  loginPath = "/login",
  userType,
}: AuthButtonProps) {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  // 로딩 중
  if (isLoading) {
    return (
      <div className="w-20 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  // 로그인 상태
  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        {/* 사용자 정보 */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 
                        rounded-lg bg-gray-100 dark:bg-gray-800"
        >
          <div
            className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 
                          flex items-center justify-center text-white text-xs font-medium"
          >
            {user.email.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300 max-w-32 truncate">
            {user.email}
          </span>
        </div>

        {/* 로그아웃 버튼 */}
        <button
          onClick={logout}
          className="px-4 py-2 rounded-lg text-sm font-medium
                     text-gray-700 dark:text-gray-300
                     bg-gray-100 dark:bg-gray-800
                     hover:bg-gray-200 dark:hover:bg-gray-700
                     transition-colors duration-200"
        >
          로그아웃
        </button>
      </div>
    );
  }

  // 비로그인 상태
  return (
    <Link
      href={loginPath}
      className="px-4 py-2 rounded-lg text-sm font-medium
                 text-white bg-blue-600 hover:bg-blue-700
                 transition-colors duration-200"
    >
      로그인
    </Link>
  );
}
