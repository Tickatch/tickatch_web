"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { CreateCustomerRequest } from "@/types/user";
import { cn } from "@/lib/utils";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isLoading: authLoading, userType, user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 고객 상세 정보
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");

  // 인증 체크
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (userType !== "CUSTOMER") {
        router.replace("/login");
      } else {
        checkExistingProfile();
      }
    }
  }, [authLoading, isAuthenticated, userType, router]);

  // 기존 프로필 확인
  const checkExistingProfile = async () => {
    try {
      const response = await fetch("/api/user/customers/me");
      if (response.ok) {
        router.replace("/");
      }
    } catch {
      // 에러 무시 - 프로필이 없는 것으로 간주
    }
  };

  // 전화번호 포맷팅
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // 프로필 저장
  const handleSubmit = async (e: React.FormEvent) => {
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
        email: user?.email || "",
        name: name.trim(),
        phone: phone.replace(/-/g, "") || null,
        birthDate: birthDate || null,
      };

      const response = await fetch("/api/user/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "회원 정보 등록에 실패했습니다.");
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원 정보 등록에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중
  if (authLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        {/* 상단 헤더 */}
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            {user?.email}
          </div>

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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                회원 정보 입력
              </h1>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                서비스 이용을 위한 정보를 입력해주세요
              </p>
            </div>

            {/* 안내 메시지 */}
            <div className="mb-6 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                    거의 다 됐어요!
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                    간단한 정보만 입력하면 회원가입이 완료됩니다.
                  </p>
                </div>
              </div>
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

                {/* 등록 버튼 */}
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
                    등록 중...
                  </span>
                  ) : (
                      "가입 완료"
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
  );
}