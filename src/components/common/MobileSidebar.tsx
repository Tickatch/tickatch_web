"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/types/product";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// 메뉴 섹션 정의
const infoMenus = [
  { label: "공지사항", href: "/notice" },
  { label: "이벤트", href: "/event" },
  { label: "이용안내", href: "/guide" },
];

const myMenus = [
  { label: "예매확인/취소", href: "/mypage/reservations" },
];

export default function MobileSidebar({
                                        isOpen,
                                        onClose,
                                      }: MobileSidebarProps) {
  const { isAuthenticated } = useAuth();

  // 사이드바 열림 시 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
      <>
        {/* 오버레이 */}
        <div
            className={cn(
                "fixed inset-0 bg-black/60 z-50",
                "transition-opacity duration-300",
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={onClose}
            aria-hidden="true"
        />

        {/* 사이드바 */}
        <aside
            className={cn(
                "fixed top-0 left-0 h-full w-64",
                "bg-[#1a1a1a] text-gray-300",
                "z-50 shadow-2xl",
                "transform transition-transform duration-300 ease-out",
                "flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}
        >
          {/* 헤더 - 햄버거 + 닫기 */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-gray-800">
            {/* 햄버거 아이콘 (장식용) */}
            <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
              <span className="w-5 h-0.5 bg-gray-400"></span>
              <span className="w-5 h-0.5 bg-gray-400"></span>
              <span className="w-3 h-0.5 bg-gray-400"></span>
            </div>

            {/* 닫기 버튼 */}
            <button
                onClick={onClose}
                className={cn(
                    "w-8 h-8 rounded-full",
                    "flex items-center justify-center",
                    "bg-gray-700 hover:bg-gray-600",
                    "text-gray-300",
                    "transition-colors"
                )}
                aria-label="메뉴 닫기"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 스크롤 영역 */}
          <div className="flex-1 overflow-y-auto">
            {/* 카테고리 메뉴 */}
            <nav className="py-4">
              {CATEGORIES.map((category) => (
                  <Link
                      key={category.type}
                      href={category.href}
                      onClick={onClose}
                      className={cn(
                          "block px-5 py-3",
                          "text-[15px] font-medium text-gray-200",
                          "hover:text-white hover:bg-gray-800/50",
                          "transition-colors duration-200"
                      )}
                  >
                    {category.label}
                  </Link>
              ))}
            </nav>

            {/* 구분선 */}
            <div className="mx-4 border-t border-gray-700" />

            {/* 정보 메뉴 */}
            <nav className="py-4">
              {infoMenus.map((menu) => (
                  <Link
                      key={menu.href}
                      href={menu.href}
                      onClick={onClose}
                      className={cn(
                          "block px-5 py-2.5",
                          "text-sm text-gray-400",
                          "hover:text-white hover:bg-gray-800/50",
                          "transition-colors duration-200"
                      )}
                  >
                    {menu.label}
                  </Link>
              ))}
            </nav>

            {/* 구분선 */}
            <div className="mx-4 border-t border-gray-700" />

            {/* MY티켓 섹션 */}
            <div className="py-4">
              <div className="px-5 py-2">
                <span className="text-sm font-semibold text-white">MY티켓</span>
              </div>
              {myMenus.map((menu) => (
                  <Link
                      key={menu.href}
                      href={isAuthenticated ? menu.href : "/login"}
                      onClick={onClose}
                      className={cn(
                          "block px-5 py-2.5",
                          "text-sm text-gray-400",
                          "hover:text-white hover:bg-gray-800/50",
                          "transition-colors duration-200"
                      )}
                  >
                    - {menu.label}
                  </Link>
              ))}
            </div>
          </div>
        </aside>
      </>
  );
}