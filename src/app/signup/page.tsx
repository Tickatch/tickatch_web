"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { LoginResponse } from "@/types/auth";
import { CreateCustomerRequest } from "@/types/user";
import { cn } from "@/lib/utils";

type SignupStep = "auth" | "profile";

export default function CustomerSignupPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { login } = useAuth();

  // 단계 관리
  const [step, setStep] = useState<SignupStep>("auth");

  // 공통 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1단계: Auth 정보
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  // 1단계 완료 후 받은 토큰 저장
  const [authToken, setAuthToken] = useState<LoginResponse | null>(null);

  // 2단계: 고객 상세 정보
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");

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
        body: JSON.stringify({ email, userType: "CUSTOMER" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "이메일 확인에 실패했습니다.");
      }

      setEmailAvailable(result.data.available);
      if (!result.data.available) {
        setError("이미 사용 중인 이메일입니다.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "이메일 확인에 실패했습니다.");
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // 1단계: Auth 서버 회원가입 후 로그인
  const handleAuthSubmit = async (e: React.FormEvent) => {
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
      // 1. 회원가입 요청
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          userType: "CUSTOMER",
          rememberMe,
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerData.error || "회원가입에 실패했습니다.");
      }

      // 2. 회원가입 성공 후 바로 로그인하여 쿠키에 토큰 저장
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          userType: "CUSTOMER",
          rememberMe,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok || !loginData.success) {
        throw new Error(loginData.error || "로그인에 실패했습니다.");
      }

      // 토큰 저장하고 2단계로 이동
      setAuthToken(loginData.data as LoginResponse);
      setStep("profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 전화번호 포맷팅
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // 2단계: User 서버에 고객 정보 등록
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 유효성 검사
    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const customerData: CreateCustomerRequest = {
        email,
        name: name.trim(),
        phone: phone.replace(/-/g, "") || null,
        birthDate: birthDate || null,
      };

      // 쿠키에 토큰이 저장되어 있으므로 Authorization 헤더 없이 요청
      const response = await fetch("/api/user/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "회원 정보 등록에 실패했습니다.");
      }

      // 로그인 처리 후 메인 페이지로 이동
      if (authToken) {
        await login(authToken);
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원 정보 등록에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* 단계 표시 */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-4">
            <div className={cn(
                "flex items-center gap-2",
                step === "auth" ? "text-orange-500" : "text-gray-400"
            )}>
              <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step === "auth"
                      ? "bg-orange-500 text-white"
                      : "bg-orange-100 dark:bg-orange-900 text-orange-500"
              )}>
                {step === "profile" ? "✓" : "1"}
              </div>
              <span className="text-sm font-medium">계정 생성</span>
            </div>

            <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700" />

            <div className={cn(
                "flex items-center gap-2",
                step === "profile" ? "text-orange-500" : "text-gray-400"
            )}>
              <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step === "profile"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500"
              )}>
                2
              </div>
              <span className="text-sm font-medium">회원 정보</span>
            </div>
          </div>
        </div>

        {/* 메인 */}
        <main className="flex-1 flex items-start justify-center px-4 pb-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {step === "auth" ? "회원가입" : "회원 정보 입력"}
              </h1>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {step === "auth"
                    ? "티캣치와 함께 특별한 공연을 만나보세요"
                    : "서비스 이용을 위한 정보를 입력해주세요"}
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

              {/* 1단계: 계정 생성 */}
              {step === "auth" && (
                  <form onSubmit={handleAuthSubmit} className="space-y-4">
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
                            placeholder="example@email.com"
                            disabled={isLoading}
                            className={cn(
                                "flex-1 px-4 py-3 rounded-xl",
                                "bg-gray-50 dark:bg-gray-800",
                                "border",
                                emailAvailable === true && "border-orange-500",
                                emailAvailable === false && "border-red-500",
                                emailAvailable === null && "border-gray-200 dark:border-gray-700",
                                "text-gray-900 dark:text-white",
                                "placeholder:text-gray-400",
                                "focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500",
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
                          <p className="mt-1 text-sm text-orange-600 dark:text-orange-400">사용 가능한 이메일입니다.</p>
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
                              "focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500",
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
                            className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                      [필수] 서비스 이용약관 동의
                    </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={agreePrivacy}
                            onChange={(e) => setAgreePrivacy(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                      [필수] 개인정보처리방침 동의
                    </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={agreeMarketing}
                            onChange={(e) => setAgreeMarketing(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                      [선택] 마케팅 정보 수신 동의
                    </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                      로그인 상태 유지
                    </span>
                      </label>
                    </div>

                    {/* 다음 단계 버튼 */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={cn(
                            "w-full py-3.5 px-4 rounded-xl mt-4",
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
                      처리 중...
                    </span>
                      ) : (
                          "다음 단계"
                      )}
                    </button>
                  </form>
              )}

              {/* 2단계: 회원 정보 입력 */}
              {step === "profile" && (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    {/* 이름 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        이름 <span className="text-red-500">*</span>
                      </label>
                      <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="홍길동"
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

                    {/* 연락처 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        연락처 <span className="text-gray-400 font-normal">(선택)</span>
                      </label>
                      <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                          placeholder="010-1234-5678"
                          maxLength={13}
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

                    {/* 생년월일 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        생년월일 <span className="text-gray-400 font-normal">(선택)</span>
                      </label>
                      <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          disabled={isLoading}
                          className={cn(
                              "w-full px-4 py-3 rounded-xl",
                              "bg-gray-50 dark:bg-gray-800",
                              "border border-gray-200 dark:border-gray-700",
                              "text-gray-900 dark:text-white",
                              "focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500",
                              "disabled:opacity-50"
                          )}
                      />
                    </div>

                    {/* 버튼 그룹 */}
                    <div className="flex gap-3 pt-4">
                      <button
                          type="button"
                          onClick={() => setStep("auth")}
                          disabled={isLoading}
                          className={cn(
                              "flex-1 py-3.5 px-4 rounded-xl",
                              "bg-gray-100 dark:bg-gray-800",
                              "hover:bg-gray-200 dark:hover:bg-gray-700",
                              "text-gray-700 dark:text-gray-200 font-medium",
                              "disabled:opacity-50 disabled:cursor-not-allowed",
                              "transition-colors"
                          )}
                      >
                        이전
                      </button>
                      <button
                          type="submit"
                          disabled={isLoading}
                          className={cn(
                              "flex-[2] py-3.5 px-4 rounded-xl",
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
                        등록 중...
                      </span>
                        ) : (
                            "가입 완료"
                        )}
                      </button>
                    </div>
                  </form>
              )}

              <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                이미 계정이 있으신가요?{" "}
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