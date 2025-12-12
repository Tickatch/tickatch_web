"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserType, ProviderType } from "@/types/auth";
import { cn } from "@/lib/utils";

interface LoginCardProps {
  userType: UserType;
  onLogin: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<void>;
  onOAuthLogin?: (provider: ProviderType) => void;
  isLoading?: boolean;
  isOAuthLoading?: boolean;
  error?: string | null;
}

const loginConfig: Record<
  UserType,
  {
    title: string;
    subtitle: string;
    logo: string;
    buttonColor: string;
    showOAuth: boolean;
    showRegister: boolean;
    registerPath: string;
  }
> = {
  CUSTOMER: {
    title: "고객 로그인",
    subtitle: "티케팅 서비스에 오신 것을 환영합니다",
    logo: "/images/logo-customer.png",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    showOAuth: true,
    showRegister: true,
    registerPath: "/register",
  },
  SELLER: {
    title: "판매자 로그인",
    subtitle: "판매자 센터에 로그인하세요",
    logo: "/images/logo-seller.png",
    buttonColor: "bg-emerald-600 hover:bg-emerald-700",
    showOAuth: false,
    showRegister: true,
    registerPath: "/seller/register",
  },
  ADMIN: {
    title: "관리자 로그인",
    subtitle: "관리자 전용 페이지입니다",
    logo: "/images/logo-admin.png",
    buttonColor: "bg-purple-600 hover:bg-purple-700",
    showOAuth: false,
    showRegister: false,
    registerPath: "",
  },
};

const oauthProviders: {
  type: ProviderType;
  name: string;
  color: string;
  icon: string;
}[] = [
  {
    type: "KAKAO",
    name: "카카오",
    color: "bg-[#FEE500] hover:bg-[#FDD835] text-[#3C1E1E]",
    icon: "💬",
  },
  {
    type: "NAVER",
    name: "네이버",
    color: "bg-[#03C75A] hover:bg-[#02B150] text-white",
    icon: "N",
  },
  {
    type: "GOOGLE",
    name: "구글",
    color: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300",
    icon: "G",
  },
];

export default function LoginCard({
  userType,
  onLogin,
  onOAuthLogin,
  isLoading = false,
  isOAuthLoading = false,
  error = null,
}: LoginCardProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const config = loginConfig[userType];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onLogin(email, password, rememberMe);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={cn(
          "bg-white dark:bg-gray-800 rounded-2xl shadow-2xl",
          "overflow-hidden border border-gray-200 dark:border-gray-700"
        )}
      >
        <div
          className={cn(
            "relative h-24 bg-gray-50 dark:bg-gray-700/50",
            "flex items-center justify-center",
            "border-b border-gray-200 dark:border-gray-700"
          )}
        >
          <Link href="/">
          <Image
            src={config.logo}
            alt="Tickatch 로고"
            width={180}
            height={60}
            className={cn(
              "object-contain h-14 w-auto",
              "dark:brightness-0 dark:invert"
            )}
            priority
          />
          </Link>
        </div>

        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {config.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {config.subtitle}
            </p>
          </div>

          {error && (
            <div
              className={cn(
                "mb-4 p-3 rounded-lg",
                "bg-red-50 dark:bg-red-900/30",
                "border border-red-200 dark:border-red-800"
              )}
            >
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isOAuthLoading}
                className={cn(
                  "w-full px-4 py-3 rounded-lg",
                  "bg-gray-50 dark:bg-gray-700",
                  "border border-gray-300 dark:border-gray-600",
                  "text-gray-900 dark:text-white",
                  "placeholder-gray-500 dark:placeholder-gray-400",
                  "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  "transition-colors duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                비밀번호
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || isOAuthLoading}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg pr-12",
                    "bg-gray-50 dark:bg-gray-700",
                    "border border-gray-300 dark:border-gray-600",
                    "text-gray-900 dark:text-white",
                    "placeholder-gray-500 dark:placeholder-gray-400",
                    "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "transition-colors duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isOAuthLoading}
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2",
                    "text-gray-500 hover:text-gray-700",
                    "dark:text-gray-400 dark:hover:text-gray-200",
                    "disabled:opacity-50"
                  )}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading || isOAuthLoading}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  로그인 유지
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                비밀번호 찾기
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || isOAuthLoading}
              className={cn(
                "w-full py-3 rounded-lg text-white font-medium",
                config.buttonColor,
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors duration-200",
                "flex items-center justify-center gap-2"
              )}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>로그인 중...</span>
                </>
              ) : (
                "로그인"
              )}
            </button>
          </form>

          {config.showOAuth && onOAuthLogin && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                    또는
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {oauthProviders.map((provider) => (
                  <button
                    key={provider.type}
                    onClick={() => onOAuthLogin(provider.type)}
                    disabled={isLoading || isOAuthLoading}
                    className={cn(
                      "w-full py-3 rounded-lg font-medium",
                      provider.color,
                      "transition-colors duration-200",
                      "flex items-center justify-center gap-2",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {isOAuthLoading ? (
                      <>
                        <svg
                          className="animate-spin w-5 h-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>인증 중...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg">{provider.icon}</span>
                        <span>{provider.name}로 로그인</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {config.showRegister && (
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              계정이 없으신가요?{" "}
              <Link
                href={config.registerPath}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                회원가입
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
