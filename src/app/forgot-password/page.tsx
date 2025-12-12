"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { API_CONFIG } from "@/lib/api-client";
import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@/lib/utils";

type Step = "email" | "sent" | "reset" | "complete";

export default function CustomerForgotPasswordPage() {
  const { theme, toggleTheme } = useTheme();
  const [step, setStep] = useState<Step>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  // 이메일로 인증 코드 발송
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userType: "CUSTOMER" }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || "이메일 발송에 실패했습니다.");
      }

      setStep("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "이메일 발송에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        {/* 상단 헤더 */}
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <Link
              href="/login"
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
          <Link href="/">
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
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {step === "email" && "가입한 이메일을 입력해주세요"}
                {step === "sent" && "이메일을 확인해주세요"}
              </p>
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

              {step === "email" && (
                  <form onSubmit={handleSendEmail} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        이메일
                      </label>
                      <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="example@email.com"
                          disabled={isLoading}
                          className={cn(
                              "w-full px-4 py-3 rounded-xl",
                              "bg-gray-50 dark:bg-gray-800",
                              "border border-gray-200 dark:border-gray-700",
                              "text-gray-900 dark:text-white",
                              "placeholder:text-gray-400",
                              "focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500",
                              "disabled:opacity-50"
                          )}
                      />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={cn(
                            "w-full py-3.5 px-4 rounded-xl",
                            "bg-gradient-to-r from-orange-500 to-rose-500",
                            "hover:from-orange-600 hover:to-rose-600",
                            "text-white font-semibold",
                            "shadow-lg shadow-orange-500/25",
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
                      발송 중...
                    </span>
                      ) : (
                          "비밀번호 재설정 이메일 발송"
                      )}
                    </button>
                  </form>
              )}

              {step === "sent" && (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      이메일을 발송했습니다
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
                      <br />
                      으로 비밀번호 재설정 링크를 발송했습니다.
                      <br />
                      이메일을 확인해주세요.
                    </p>

                    <div className="space-y-3">
                      <button
                          onClick={() => setStep("email")}
                          className={cn(
                              "w-full py-3 px-4 rounded-xl",
                              "bg-gray-100 dark:bg-gray-800",
                              "text-gray-700 dark:text-gray-200 font-medium",
                              "hover:bg-gray-200 dark:hover:bg-gray-700",
                              "transition-colors"
                          )}
                      >
                        다른 이메일로 시도
                      </button>

                      <Link
                          href="/login"
                          className={cn(
                              "block w-full py-3 px-4 rounded-xl text-center",
                              "bg-gradient-to-r from-orange-500 to-rose-500",
                              "hover:from-orange-600 hover:to-rose-600",
                              "text-white font-semibold",
                              "transition-all"
                          )}
                      >
                        로그인 페이지로 이동
                      </Link>
                    </div>
                  </div>
              )}

              <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                비밀번호가 기억나셨나요?{" "}
                <Link href="/login" className="text-orange-500 hover:text-orange-600 font-medium">
                  로그인
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
  );
}