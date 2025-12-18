"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AdminProfile {
  email: string;
  nickname: string;
  phone?: string;
  createdAt?: string;
}

export default function AdminMyPage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [profile, setProfile] = useState<AdminProfile>({
    email: "",
    nickname: "",
    phone: "",
  });

  const [editForm, setEditForm] = useState({
    nickname: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 초기 데이터 로드
  useEffect(() => {
    if (user) {
      setProfile({
        email: user.email,
        nickname: user.nickname || "",
        phone: "",
        createdAt: new Date().toISOString(),
      });
      setEditForm({
        nickname: user.nickname || "",
        phone: "",
      });
    }
  }, [user]);

  // 프로필 저장
  const handleSaveProfile = async () => {
    if (!editForm.nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    if (!user?.id) {
      alert("사용자 정보를 불러올 수 없습니다.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/user/admins/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.nickname.trim(),
          phone: editForm.phone.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "프로필 저장에 실패했습니다.");
      }

      setProfile((prev) => ({
        ...prev,
        nickname: editForm.nickname,
        phone: editForm.phone,
      }));
      setIsEditing(false);
      alert("프로필이 저장되었습니다.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "프로필 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 비밀번호 변경
  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword) {
      alert("현재 비밀번호를 입력해주세요.");
      return;
    }
    if (!passwordForm.newPassword) {
      alert("새 비밀번호를 입력해주세요.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      alert("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || "비밀번호 변경에 실패했습니다.");
      }

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setIsChangingPassword(false);
      alert("비밀번호가 변경되었습니다.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "비밀번호 변경에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const userInitial = profile.nickname?.charAt(0) || profile.email?.charAt(0) || "A";

  return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            마이페이지
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            관리자 계정 정보를 확인하고 수정합니다.
          </p>
        </div>

        {/* 프로필 카드 */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* 프로필 헤더 */}
          <div className="bg-gradient-to-r from-orange-400 to-rose-500 h-24" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-12 mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white dark:ring-gray-900">
                {userInitial.toUpperCase()}
              </div>
              <div className="pb-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {profile.nickname || profile.email}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">관리자</p>
              </div>
            </div>

            {/* 프로필 정보 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  기본 정보
                </h3>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      수정
                    </button>
                ) : (
                    <div className="flex gap-2">
                      <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditForm({ nickname: profile.nickname, phone: profile.phone || "" });
                          }}
                          className="px-4 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        취소
                      </button>
                      <button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? "저장 중..." : "저장"}
                      </button>
                    </div>
                )}
              </div>

              {isEditing ? (
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        이메일
                      </label>
                      <input
                          type="email"
                          value={profile.email}
                          disabled
                          className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        닉네임
                      </label>
                      <input
                          type="text"
                          value={editForm.nickname}
                          onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        연락처
                      </label>
                      <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          placeholder="010-0000-0000"
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
              ) : (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">이메일</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white font-medium">{profile.email}</dd>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">닉네임</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white font-medium">{profile.nickname || "-"}</dd>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">연락처</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white font-medium">{profile.phone || "-"}</dd>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">가입일</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white font-medium">
                        {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("ko-KR") : "-"}
                      </dd>
                    </div>
                  </dl>
              )}
            </div>
          </div>
        </div>

        {/* 비밀번호 변경 */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                비밀번호 변경
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                보안을 위해 주기적으로 비밀번호를 변경하세요.
              </p>
            </div>
            {!isChangingPassword && (
                <button
                    onClick={() => setIsChangingPassword(true)}
                    className="px-4 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  변경하기
                </button>
            )}
          </div>

          {isChangingPassword && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    현재 비밀번호
                  </label>
                  <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    새 비밀번호
                  </label>
                  <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="8자 이상"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    새 비밀번호 확인
                  </label>
                  <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                      }}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    취소
                  </button>
                  <button
                      onClick={handleChangePassword}
                      disabled={isSaving}
                      className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? "변경 중..." : "비밀번호 변경"}
                  </button>
                </div>
              </div>
          )}
        </div>

        {/* 계정 정보 */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            계정 권한
          </h3>
          <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-purple-900 dark:text-purple-100">시스템 관리자</p>
              <p className="text-sm text-purple-700 dark:text-purple-300">모든 관리 기능에 접근할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>
  );
}