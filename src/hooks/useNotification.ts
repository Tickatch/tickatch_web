"use client";

import { useState, useCallback } from "react";
import { Notification } from "@/types/auth";

// 임시 더미 데이터 (나중에 API 연동)
const dummyNotifications: Notification[] = [
  {
    id: "1",
    title: "티켓 예매 완료",
    message: "콘서트 티켓 예매가 완료되었습니다.",
    read: false,
    createdAt: new Date().toISOString(),
    link: "/tickets/1",
  },
  {
    id: "2",
    title: "새로운 이벤트",
    message: "관심 아티스트의 새로운 공연이 등록되었습니다.",
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "3",
    title: "결제 완료",
    message: "결제가 정상적으로 처리되었습니다.",
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function useNotification() {
  const [notifications, setNotifications] =
    useState<Notification[]>(dummyNotifications);
  const [isOpen, setIsOpen] = useState(false);

  // 읽지 않은 알림 개수
  const unreadCount = notifications.filter((n) => !n.read).length;

  // 읽지 않은 알림 존재 여부
  const hasUnread = unreadCount > 0;

  // 알림 목록 토글
  const toggleNotifications = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // 알림 목록 닫기
  const closeNotifications = useCallback(() => {
    setIsOpen(false);
  }, []);

  // 알림 읽음 처리
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // 알림 삭제
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return {
    notifications,
    isOpen,
    unreadCount,
    hasUnread,
    toggleNotifications,
    closeNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
  };
}
