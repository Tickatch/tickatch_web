"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    // TODO: API 호출로 설정 저장
  };

  const handlePasswordChange = () => {
    // TODO: 비밀번호 변경 모달 또는 페이지
    alert("비밀번호 변경 기능은 준비 중입니다.");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("정말 탈퇴하시겠습니까?\n탈퇴 시 모든 데이터가 삭제됩니다.")) return;
    if (!confirm("탈퇴 후에는 복구할 수 없습니다. 계속하시겠습니까?")) return;

    setIsDeleting(true);
    try {
      // TODO: 실제 API 연동
      // await fetch("/api/user/customers/me", { method: "DELETE" });

      alert("회원 탈퇴가 완료되었습니다.");
      logout();
      router.push("/");
    } catch (error) {
      console.error("Delete account error:", error);
      alert("탈퇴에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
      <div className="space-y-6">
        {/* 알림 설정 */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              알림 설정
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">이메일 알림</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  예매 확인, 공연 알림 등을 이메일로 받습니다
                </p>
              </div>
              <button
                  onClick={() => handleNotificationChange("email")}
                  className={cn(
                      "relative w-12 h-6 rounded-full transition-colors",
                      notifications.email ? "bg-orange-500" : "bg-gray-300 dark:bg-gray-600"
                  )}
              >
              <span
                  className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                      notifications.email ? "left-7" : "left-1"
                  )}
              />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">SMS 알림</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  중요 알림을 문자로 받습니다
                </p>
              </div>
              <button
                  onClick={() => handleNotificationChange("sms")}
                  className={cn(
                      "relative w-12 h-6 rounded-full transition-colors",
                      notifications.sms ? "bg-orange-500" : "bg-gray-300 dark:bg-gray-600"
                  )}
              >
              <span
                  className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                      notifications.sms ? "left-7" : "left-1"
                  )}
              />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">푸시 알림</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  앱 푸시 알림을 받습니다
                </p>
              </div>
              <button
                  onClick={() => handleNotificationChange("push")}
                  className={cn(
                      "relative w-12 h-6 rounded-full transition-colors",
                      notifications.push ? "bg-orange-500" : "bg-gray-300 dark:bg-gray-600"
                  )}
              >
              <span
                  className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                      notifications.push ? "left-7" : "left-1"
                  )}
              />
              </button>
            </div>
          </div>
        </div>

        {/* 계정 설정 */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              계정 설정
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <button
                onClick={handlePasswordChange}
                className="w-full flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-medium text-gray-900 dark:text-white">비밀번호 변경</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
                onClick={() => logout()}
                className="w-full flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium text-gray-900 dark:text-white">로그아웃</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* 위험 구역 */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-800/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20">
            <h2 className="text-lg font-bold text-red-600 dark:text-red-400">
              위험 구역
            </h2>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">회원 탈퇴</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다
                </p>
              </div>
              <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "처리 중..." : "탈퇴하기"}
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}