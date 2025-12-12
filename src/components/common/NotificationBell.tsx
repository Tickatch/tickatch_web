"use client";

import { useEffect, useRef } from "react";
import { useNotification } from "@/hooks/useNotification";
import NotificationDropdown from "./NotificationDropdown";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  isScrolled?: boolean;
}

export default function NotificationBell({ isScrolled = true }: NotificationBellProps) {
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

  // 외부 클릭 감지
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
            className={cn(
                "relative w-10 h-10 rounded-lg flex items-center justify-center",
                "transition-colors duration-200",
                isScrolled
                    ? [
                      // 라이트모드
                      "bg-gray-100 hover:bg-gray-200",
                      // 다크모드
                      "dark:bg-gray-800 dark:hover:bg-gray-700"
                    ]
                    : "bg-white/10 hover:bg-white/20"
            )}
            aria-label="알림"
            aria-expanded={isOpen}
        >
          <svg
              className={cn(
                  "w-5 h-5",
                  isScrolled
                      ? "text-gray-600 dark:text-gray-300"
                      : "text-white/90"
              )}
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

          {hasUnread && (
              <span
                  className={cn(
                      "absolute top-1.5 right-1.5 w-2.5 h-2.5",
                      "bg-red-500 rounded-full",
                      "animate-pulse",
                      isScrolled
                          ? "ring-2 ring-white dark:ring-black"
                          : "ring-2 ring-black/20"
                  )}
              />
          )}
        </button>

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