"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api";
import { cn } from "@/lib/utils";

interface CustomerProfile {
  id: number;
  email: string;
  nickname: string;
  phoneNumber?: string;
  createdAt: string;
}

export default function MypagePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user/customers/me");
        const result: ApiResponse<CustomerProfile> = await response.json();
        if (result.success && result.data) {
          setProfile(result.data);
          setNickname(result.data.nickname || "");
          setPhoneNumber(result.data.phoneNumber || "");
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/user/customers/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, phoneNumber }),
      });

      const result = await response.json();
      if (result.success) {
        setProfile((prev) => prev ? { ...prev, nickname, phoneNumber } : null);
        setIsEditing(false);
        alert("프로필이 수정되었습니다.");
      } else {
        alert(result.error?.message || "수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      alert("서버 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* 프로필 카드 */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              마이페이지
            </h1>
          </div>

          <div className="p-6">
            {/* 프로필 헤더 */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white text-2xl font-bold">
                {(profile?.nickname || user?.email)?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {profile?.nickname || "닉네임 없음"}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">{profile?.email}</p>
              </div>
            </div>

            {/* 프로필 정보 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">이메일</span>
                <span className="text-gray-900 dark:text-white">{profile?.email}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">닉네임</span>
                {isEditing ? (
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                ) : (
                    <span className="text-gray-900 dark:text-white">
                  {profile?.nickname || "-"}
                </span>
                )}
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">연락처</span>
                {isEditing ? (
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="010-0000-0000"
                        className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                ) : (
                    <span className="text-gray-900 dark:text-white">
                  {profile?.phoneNumber || "-"}
                </span>
                )}
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-gray-500 dark:text-gray-400">가입일</span>
                <span className="text-gray-900 dark:text-white">
                {profile?.createdAt ? formatDate(profile.createdAt) : "-"}
              </span>
              </div>
            </div>

            {/* 버튼 */}
            <div className="mt-8 flex gap-3">
              {isEditing ? (
                  <>
                    <button
                        onClick={() => {
                          setIsEditing(false);
                          setNickname(profile?.nickname || "");
                          setPhoneNumber(profile?.phoneNumber || "");
                        }}
                        className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      취소
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors disabled:opacity-50"
                    >
                      {isSaving ? "저장 중..." : "저장"}
                    </button>
                  </>
              ) : (
                  <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors"
                  >
                    프로필 수정
                  </button>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}