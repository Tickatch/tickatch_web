"use client";

import { Notification } from "@/types/auth";
import { cn } from "@/lib/utils";

interface NotificationDropdownProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRemove: (id: string) => void;
}

export default function NotificationDropdown({
                                               notifications,
                                               onClose,
                                               onMarkAsRead,
                                               onMarkAllAsRead,
                                               onRemove,
                                             }: NotificationDropdownProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString("ko-KR");
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.link) {
      console.log("Navigate to:", notification.link);
    }
  };

  return (
      <div
          className={cn(
              "absolute right-0 top-12 w-80 max-h-96 overflow-hidden",
              "bg-white dark:bg-gray-900",
              "rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700",
              "z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">알림</h3>
          <button
              onClick={onMarkAllAsRead}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            모두 읽음
          </button>
        </div>

        <div className="overflow-y-auto max-h-72">
          {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                새로운 알림이 없습니다
              </div>
          ) : (
              notifications.map((notification) => (
                  <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                          "px-4 py-3 border-b border-gray-100 dark:border-gray-700",
                          "cursor-pointer transition-colors",
                          "hover:bg-gray-50 dark:hover:bg-gray-700/50",
                          !notification.read && "bg-blue-50/50 dark:bg-blue-900/20"
                      )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1.5">
                        {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                        {notification.read && <div className="w-2 h-2" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                            className={cn(
                                "text-sm font-medium truncate",
                                !notification.read
                                    ? "text-gray-900 dark:text-white"
                                    : "text-gray-700 dark:text-gray-300"
                            )}
                        >
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>

                      <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(notification.id);
                          }}
                          className={cn(
                              "flex-shrink-0 p-1 rounded",
                              "hover:bg-gray-200 dark:hover:bg-gray-600",
                              "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          )}
                      >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
              ))
          )}
        </div>

        {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
              <button
                  onClick={onClose}
                  className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-1"
              >
                닫기
              </button>
            </div>
        )}
      </div>
  );
}