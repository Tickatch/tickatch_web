"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { API_CONFIG } from "@/lib/api-client";
import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@/lib/utils";

interface SignupForm {
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
}

export default function CustomerSignupPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<SignupForm>({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  });

  const updateForm = (field: keyof SignupForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!form.email) return "이메일을 입력해주세요.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "올바른 이메일 형식이 아닙니다.";
    if (!form.password) return "비밀번호를 입력해주세요.";
    if (form.password.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
    if (form.password !== form.passwordConfirm) return "비밀번호가 일치하지 않습니다.";
    if (!form.nickname) return "닉네임을 입력해주세요.";
    if (form.nickname.length < 2) return "닉네임은 2자 이상이어야 합니다.";
    if (!form.agreeTerms) return "이용약관에 동의해주세요.";
    if (!form.agreePrivacy) return "개인정보처리방침에 동의해주세요.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          nickname: form.nickname,
          userType: "CUSTOMER",
          agreeMarketing: form.agreeMarketing,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || "회원가입에 실패했습니다.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgreeAll = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      agreeTerms: checked,
      agreePrivacy: checked,
      agreeMarketing: checked,
    }));
  };

  const isAllAgreed = form.agreeTerms && form.agreePrivacy && form.agreeMarketing;

  if (success) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              회원가입이 완료되었습니다!
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
              href="/"
              className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">홈으로</span>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">회원가입</h1>
              <p className="mt-2 text-gray-500 dark:text-gray-400">티캣치와 함께 시작하세요</p>
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
                  <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
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

                {/* 비밀번호 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    비밀번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                      type="password"
                      value={form.password}
                      onChange={(e) => updateForm("password", e.target.value)}
                      placeholder="8자 이상 입력"
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

                {/* 비밀번호 확인 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    비밀번호 확인 <span className="text-red-500">*</span>
                  </label>
                  <input
                      type="password"
                      value={form.passwordConfirm}
                      onChange={(e) => updateForm("passwordConfirm", e.target.value)}
                      placeholder="비밀번호 재입력"
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

                {/* 닉네임 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    닉네임 <span className="text-red-500">*</span>
                  </label>
                  <input
                      type="text"
                      value={form.nickname}
                      onChange={(e) => updateForm("nickname", e.target.value)}
                      placeholder="2자 이상 입력"
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

                {/* 약관 동의 */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input
                        type="checkbox"
                        checked={isAllAgreed}
                        onChange={(e) => handleAgreeAll(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="font-medium text-gray-900 dark:text-white">전체 동의</span>
                  </label>

                  <div className="ml-8 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                          type="checkbox"
                          checked={form.agreeTerms}
                          onChange={(e) => updateForm("agreeTerms", e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                      [필수] 이용약관 동의
                    </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                          type="checkbox"
                          checked={form.agreePrivacy}
                          onChange={(e) => updateForm("agreePrivacy", e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                      [필수] 개인정보처리방침 동의
                    </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                          type="checkbox"
                          checked={form.agreeMarketing}
                          onChange={(e) => updateForm("agreeMarketing", e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                      [선택] 마케팅 정보 수신 동의
                    </span>
                    </label>
                  </div>
                </div>

                {/* 가입 버튼 */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                        "w-full py-3.5 px-4 rounded-xl mt-6",
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
                    가입 중...
                  </span>
                  ) : (
                      "회원가입"
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                이미 회원이신가요?{" "}
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