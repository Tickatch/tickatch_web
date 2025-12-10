"use client";

import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
import AuthButton from "./AuthButton";
import { UserType } from "@/types/auth";
import { useAuth } from "@/providers/AuthProvider";

interface HeaderProps {
  userType: UserType;
}

// 유저 타입별 설정
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
    logo: "/images/logo-seller.png",
    loginPath: "/seller/login",
    homePath: "/seller",
  },
  ADMIN: {
    logo: "/images/logo-admin.png",
    loginPath: "/admin/login",
    homePath: "/admin",
  },
};

export default function Header({ userType }: HeaderProps) {
  const config = headerConfig[userType];
  const { isAuthenticated } = useAuth();

  return (
    <header
      className="sticky top-0 z-40 w-full 
                       bg-white/80 dark:bg-gray-900/80 
                       backdrop-blur-md
                       border-b border-gray-200 dark:border-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 영역 - 이미지만 표시 */}
          <Link href={config.homePath} className="flex items-center group">
            <div className="h-10 flex items-center">
              <Image
                src={config.logo}
                alt="Tickatch 로고"
                width={140}
                height={40}
                className="object-contain h-10 w-auto
                          group-hover:scale-105 transition-transform duration-200"
                priority
              />
            </div>
          </Link>

          {/* 오른쪽 영역 */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 알림 버튼 - 로그인 시에만 표시 */}
            {isAuthenticated && <NotificationBell />}

            {/* 다크모드 토글 */}
            <ThemeToggle />

            {/* 로그인/로그아웃 버튼 */}
            <AuthButton loginPath={config.loginPath} userType={userType} />
          </div>
        </div>
      </div>
    </header>
  );
}
