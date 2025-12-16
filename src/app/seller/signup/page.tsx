"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import { LoginResponse } from "@/types/auth";
import { cn } from "@/lib/utils";

export default function SellerSignupPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  // 이메일 중복 확인
  const handleCheckEmail = async () => {
    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    setIsCheckingEmail(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userType: "SELLER" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "이메일 확인에 실패했습니다.");
      }

      setEmailAvailable(data.available);
      if (!data.available) {
        setError("이미 사용 중인 이메일입니다.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "이메일 확인에 실패했습니다.");
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // 회원가입
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 유효성 검사
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("올바른 이메일을 입력해주세요.");
      return;
    }
    if (emailAvailable === false) {
      setError("이미 사용 중인 이메일입니다.");
      return;
    }
    if (!password || password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setError("필수 약관에 동의해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          userType: "SELLER",
          rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "회원가입에 실패했습니다.");
      }

      // 자동 로그인
      await login(data as LoginResponse);
      router.push("/seller");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        {/* 상단 헤더 */}
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <Link
              href="/seller"
              className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">판매자 센터로</span>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">판매자 회원가입</h1>
              <p className="mt-2 text-gray-500 dark:text-gray-400">티캣치 판매자가 되어보세요</p>
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
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailAvailable(null);
                        }}
                        placeholder="example@company.com"
                        disabled={isLoading}
                        className={cn(
                            "flex-1 px-4 py-3 rounded-xl",
                            "bg-gray-50 dark:bg-gray-800",
                            "border",
                            emailAvailable === true && "border-emerald-500",
                            emailAvailable === false && "border-red-500",
                            emailAvailable === null && "border-gray-200 dark:border-gray-700",
                            "text-gray-900 dark:text-white",
                            "placeholder:text-gray-400",
                            "focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500",
                            "disabled:opacity-50"
                        )}
                    />
                    <button
                        type="button"
                        onClick={handleCheckEmail}
                        disabled={isCheckingEmail || isLoading}
                        className={cn(
                            "px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap",
                            "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200",
                            "hover:bg-gray-200 dark:hover:bg-gray-700",
                            "disabled:opacity-50",
                            "transition-colors"
                        )}
                    >
                      {isCheckingEmail ? "확인중..." : "중복확인"}
                    </button>
                  </div>
                  {emailAvailable === true && (
                      <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">사용 가능한 이메일입니다.</p>
                  )}
                </div>

                {/* 비밀번호 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    비밀번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                {/* 비밀번호 확인 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    비밀번호 확인 <span className="text-red-500">*</span>
                  </label>
                  <input
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="비밀번호 재입력"
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

                {/* 약관 동의 */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                    [필수] 판매자 이용약관 동의
                  </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={agreePrivacy}
                        onChange={(e) => setAgreePrivacy(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                    [필수] 개인정보처리방침 동의
                  </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                    로그인 상태 유지
                  </span>
                  </label>
                </div>

                {/* 가입 버튼 */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                        "w-full py-3.5 px-4 rounded-xl mt-4",
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
                    가입 중...
                  </span>
                  ) : (
                      "판매자 가입"
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                이미 판매자 계정이 있으신가요?{" "}
                <Link href="/seller/login" className="text-emerald-500 hover:text-emerald-600 font-medium">
                  로그인
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
  );
}