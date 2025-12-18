"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginCard from "@/components/auth/LoginCard";
import { ProviderType, LoginResponse } from "@/types/auth";
import { getOAuthLoginUrl } from "@/lib/api-client";
import { useOAuthPopup } from "@/hooks/useOAuthPopup";
import { useAuth } from "@/hooks/useAuth";

export default function CustomerLoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, login, userType } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이미 로그인된 경우 고객 프로필 확인 후 리다이렉트
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (userType === "CUSTOMER") {
        checkCustomerProfile();
      } else {
        setError("고객 계정으로 로그인해주세요.");
      }
    }
  }, [authLoading, isAuthenticated, userType]);

  // 고객 프로필 확인
  const checkCustomerProfile = async () => {
    try {
      const response = await fetch("/api/user/customers/me");

      if (response.ok) {
        router.replace("/");
      } else if (response.status === 404) {
        router.replace("/complete-profile");
      } else {
        router.replace("/");
      }
    } catch {
      router.replace("/");
    }
  };

  // OAuth 성공 핸들러
  const handleOAuthSuccess = useCallback(
      async (response: LoginResponse) => {
        try {
          setIsOAuthLoading(true);
          setError(null);
          await login(response);

          // OAuth 로그인 후에도 프로필 확인
          const meResponse = await fetch("/api/user/customers/me");

          if (meResponse.ok) {
            router.push("/");
          } else if (meResponse.status === 404) {
            router.push("/complete-profile");
          } else {
            router.push("/");
          }
        } catch {
          setError("로그인 처리 중 오류가 발생했습니다.");
        } finally {
          setIsOAuthLoading(false);
        }
      },
      [login, router]
  );

  // OAuth 에러 핸들러
  const handleOAuthError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setIsOAuthLoading(false);
  }, []);

  // OAuth 취소 핸들러
  const handleOAuthCancel = useCallback(() => {
    setError("로그인을 취소하셨습니다.");
    setIsOAuthLoading(false);
  }, []);

  // OAuth 팝업 훅
  const { openOAuthPopup } = useOAuthPopup({
    onSuccess: handleOAuthSuccess,
    onError: handleOAuthError,
    onCancel: handleOAuthCancel,
  });

  // 일반 로그인 핸들러
  const handleLogin = async (
      email: string,
      password: string,
      rememberMe: boolean
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. 로그인 요청
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          userType: "CUSTOMER",
          rememberMe,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "로그인에 실패했습니다.");
      }

      // 2. 로그인 성공 - AuthProvider에 저장
      await login(result.data as LoginResponse);

      // 3. 고객 정보 확인
      const meResponse = await fetch("/api/user/customers/me");

      if (meResponse.ok) {
        router.push("/");
      } else if (meResponse.status === 404) {
        router.push("/complete-profile");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // OAuth 로그인 핸들러
  const handleOAuthLogin = (provider: ProviderType) => {
    setError(null);
    setIsOAuthLoading(true);
    openOAuthPopup(provider, false);
  };

  // 인증 로딩 중
  if (authLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  // 이미 로그인된 경우 - 프로필 확인 중
  if (isAuthenticated && userType === "CUSTOMER") {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">확인 중...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <main className="flex-1 flex items-center justify-center p-4">
          <LoginCard
              userType="CUSTOMER"
              onLogin={handleLogin}
              onOAuthLogin={handleOAuthLogin}
              isLoading={isLoading}
              isOAuthLoading={isOAuthLoading}
              error={error}
          />
        </main>
      </div>
  );
}