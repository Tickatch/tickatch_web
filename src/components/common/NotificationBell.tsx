"use client";

import { useEffect, useRef } from "react";
import { useNotification } from "@/hooks/useNotification";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationBell() {
  const {
    notifications,
    isOpen,
    hasUnread,
    toggleNotifications,
    closeNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotification();

  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeNotifications();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeNotifications]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeNotifications();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, closeNotifications]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={toggleNotifications}
        className="relative w-10 h-10 rounded-lg flex items-center justify-center
                   bg-gray-100 dark:bg-gray-800 
                   hover:bg-gray-200 dark:hover:bg-gray-700
                   transition-colors duration-200"
        aria-label="알림"
        aria-expanded={isOpen}
      >
        {/* 벨 아이콘 */}
        <svg
          className="w-5 h-5 text-gray-600 dark:text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* 읽지 않은 알림 표시 (빨간 동그라미) */}
        {hasUnread && (
          <span
            className="absolute top-1.5 right-1.5 w-2.5 h-2.5 
                          bg-red-500 rounded-full
                          ring-2 ring-white dark:ring-gray-900
                          animate-pulse"
          />
        )}
      </button>

      {/* 드롭다운 */}
      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          onClose={closeNotifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onRemove={removeNotification}
        />
      )}
    </div>
  );
}
