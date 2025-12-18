"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface SellerProfile {
  id: string;
  email: string;
  name: string;
  companyName?: string;
  phone?: string;
  businessNumber?: string;
  status: string;
  createdAt?: string;
}

export default function SellerMyPage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [profile, setProfile] = useState<SellerProfile>({
    id: "",
    email: "",
    name: "",
    companyName: "",
    phone: "",
    businessNumber: "",
    status: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    companyName: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 판매자 정보 가져오기
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user/sellers/me");
        if (response.ok) {
          const data = await response.json();
          const seller = data.data || data;
          setProfile({
            id: seller.id || "",
            email: user?.email || seller.email || "",
            name: seller.name || "",
            companyName: seller.companyName || "",
            phone: seller.phone || "",
            businessNumber: seller.businessNumber || "",
            status: seller.status || "",
            createdAt: seller.createdAt,
          });
          setEditForm({
            name: seller.name || "",
            companyName: seller.companyName || "",
            phone: seller.phone || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, [user]);

  // 프로필 저장
  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      alert("담당자명을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/user/sellers/${profile.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          companyName: editForm.companyName.trim() || null,
          phone: editForm.phone.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "프로필 저장에 실패했습니다.");
      }

      setProfile((prev) => ({
        ...prev,
        name: editForm.name,
        companyName: editForm.companyName,
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
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return { label: "승인 대기", color: "bg-yellow-100 text-yellow-800" };
      case "APPROVED": return { label: "승인됨", color: "bg-green-100 text-green-800" };
      case "REJECTED": return { label: "반려됨", color: "bg-red-100 text-red-800" };
      case "SUSPENDED": return { label: "정지됨", color: "bg-gray-100 text-gray-800" };
      default: return { label: status, color: "bg-gray-100 text-gray-800" };
    }
  };

  const statusInfo = getStatusLabel(profile.status);
  const userInitial = profile.name?.charAt(0) || profile.email?.charAt(0) || "S";

  return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            마이페이지
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            판매자 계정 정보를 확인하고 수정합니다.
          </p>
        </div>

        {/* 프로필 카드 */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* 프로필 헤더 */}
          <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-24" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-12 mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white dark:ring-gray-900">
                {userInitial.toUpperCase()}
              </div>
              <div className="pb-2 flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {profile.name || profile.email}
                  </h2>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {profile.companyName || "판매자"}
                </p>
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
                        className="px-4 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      수정
                    </button>
                ) : (
                    <div className="flex gap-2">
                      <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditForm({
                              name: profile.name,
                              companyName: profile.companyName || "",
                              phone: profile.phone || "",
                            });
                          }}
                          className="px-4 py-1.5 text-sm text-gray-600 dark:text-gray-400"
                      >
                        취소
                      </button>
                      <button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="px-4 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
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
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        담당자명 *
                      </label>
                      <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        회사/단체명
                      </label>
                      <input
                          type="text"
                          value={editForm.companyName}
                          onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                      <dt className="text-sm text-gray-500 dark:text-gray-400">담당자명</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white font-medium">{profile.name || "-"}</dd>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">회사/단체명</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white font-medium">{profile.companyName || "-"}</dd>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">연락처</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white font-medium">{profile.phone || "-"}</dd>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">사업자번호</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white font-medium">{profile.businessNumber || "-"}</dd>
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
                    className="px-4 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
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
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                      }}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    취소
                  </button>
                  <button
                      onClick={handleChangePassword}
                      disabled={isSaving}
                      className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {isSaving ? "변경 중..." : "비밀번호 변경"}
                  </button>
                </div>
              </div>
          )}
        </div>
      </div>
  );
}