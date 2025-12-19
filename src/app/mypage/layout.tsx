"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Header from "@/components/common/Header";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const mypageMenus = [
  {
    label: "마이페이지",
    href: "/mypage",
    icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
  },
  {
    label: "예매 내역",
    href: "/mypage/reservations",
    icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
    ),
  },
  {
    label: "찜 목록",
    href: "/mypage/wishlist",
    icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    ),
  },
  {
    label: "설정",
    href: "/mypage/settings",
    icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
  },
];

export default function MypageLayout({
                                       children,
                                     }: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  // 인증 체크
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=" + pathname);
    }
  }, [isAuthenticated, router, pathname]);

  // 인증 안됨
  if (!isAuthenticated) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <Header userType="CUSTOMER" forceScrolled />
          <div className="pt-16 flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header userType="CUSTOMER" forceScrolled />

        <div className="pt-16">
          <div className="max-w-[1200px] mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* 사이드바 */}
              <aside className="lg:w-64 flex-shrink-0">
                <nav className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  {mypageMenus.map((menu) => {
                    const isActive = pathname === menu.href;
                    return (
                        <Link
                            key={menu.href}
                            href={menu.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                                "border-b border-gray-100 dark:border-gray-800 last:border-b-0",
                                isActive
                                    ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            )}
                        >
                      <span className={cn(
                          isActive ? "text-orange-500" : "text-gray-400 dark:text-gray-500"
                      )}>
                        {menu.icon}
                      </span>
                          {menu.label}
                        </Link>
                    );
                  })}
                </nav>
              </aside>

              {/* 메인 컨텐츠 */}
              <main className="flex-1 min-w-0">{children}</main>
            </div>
          </div>
        </div>
      </div>
  );
}