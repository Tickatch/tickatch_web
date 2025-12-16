"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@/lib/utils";

export default function SellerForgotPasswordPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 유효성 검사
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("올바른 이메일을 입력해주세요.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/find-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          newPassword,
          userType: "SELLER",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "비밀번호 변경에 실패했습니다.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/seller/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "비밀번호 변경에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              비밀번호가 변경되었습니다!
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              잠시 후 로그인 페이지로 이동합니다...
            </p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        {/* 상단 헤더 */}
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <Link
              href="/seller/login"
              className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">로그인으로 돌아가기</span>
          </Link>

          <button
              onClick={toggleTheme}
              className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
                  "transition-colors duration-200"
              )}
          >
            {theme === "light" ? (
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ) : (
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            )}
          </button>
        </header>

        {/* 로고 */}
        <div className="flex justify-center py-6">
          <Link href="/seller">
            <Image
                src="/images/logo-customer.png"
                alt="Tickatch"
                width={150}
                height={50}
                className="h-10 w-auto dark:brightness-0 dark:invert"
                priority
            />
          </Link>
        </div>

        {/* 메인 */}
        <main className="flex-1 flex items-start justify-center px-4 pb-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">비밀번호 찾기</h1>
              <p className="mt-2 text-gray-500 dark:text-gray-400">새로운 비밀번호를 설정하세요</p>
            </div>

            <div className={cn(
                "bg-white dark:bg-gray-900",
                "rounded-2xl shadow-xl",
                "border border-gray-200 dark:border-gray-800",
                "p-8"
            )}>
              {error && (
                  <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 이메일 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    가입된 이메일
                  </label>
                  <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@company.com"
                      disabled={isLoading}
                      className={cn(
                          "w-full px-4 py-3 rounded-xl",
                          "bg-gray-50 dark:bg-gray-800",
                          "border border-gray-200 dark:border-gray-700",
                          "text-gray-900 dark:text-white",
                          "placeholder:text-gray-400",
                          "focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500",
                          "disabled:opacity-50"
                      )}
                  />
                </div>

                {/* 새 비밀번호 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    새 비밀번호
                  </label>
                  <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="8자 이상 입력"
                      disabled={isLoading}
                      className={cn(
                          "w-full px-4 py-3 rounded-xl",
                          "bg-gray-50 dark:bg-gray-800",
                          "border border-gray-200 dark:border-gray-700",
                          "text-gray-900 dark:text-white",
                          "placeholder:text-gray-400",
                          "focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500",
                          "disabled:opacity-50"
                      )}
                  />
                </div>

                {/* 새 비밀번호 확인 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    새 비밀번호 확인
                  </label>
                  <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="새 비밀번호 재입력"
                      disabled={isLoading}
                      className={cn(
                          "w-full px-4 py-3 rounded-xl",
                          "bg-gray-50 dark:bg-gray-800",
                          "border border-gray-200 dark:border-gray-700",
                          "text-gray-900 dark:text-white",
                          "placeholder:text-gray-400",
                          "focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500",
                          "disabled:opacity-50"
                      )}
                  />
                </div>

                {/* 변경 버튼 */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                        "w-full py-3.5 px-4 rounded-xl mt-2",
                        "bg-gradient-to-r from-emerald-500 to-teal-500",
                        "hover:from-emerald-600 hover:to-teal-600",
                        "text-white font-semibold",
                        "shadow-lg shadow-emerald-500/25",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "transition-all duration-200"
                    )}
                >
                  {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    변경 중...
                  </span>
                  ) : (
                      "비밀번호 변경"
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                <Link href="/seller/login" className="text-emerald-500 hover:text-emerald-600 font-medium">
                  로그인 페이지로 돌아가기
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
  );
}