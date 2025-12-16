"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginCard from "@/components/auth/LoginCard";
import { ProviderType, LoginResponse } from "@/types/auth";
import { getOAuthLoginUrl } from "@/lib/api-client";
import { useOAuthPopup } from "@/hooks/useOAuthPopup";
import { useAuth } from "@/providers/AuthProvider";

export default function CustomerLoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이미 로그인된 경우 메인으로 리다이렉트
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [authLoading, isAuthenticated, router]);

  // OAuth 성공 핸들러
  const handleOAuthSuccess = useCallback(
      async (response: LoginResponse) => {
        try {
          setIsOAuthLoading(true);
          setError(null);
          await login(response);
          router.push("/");
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

      // success 체크 추가
      if (!response.ok || !result.success) {
        throw new Error(result.error || "로그인에 실패했습니다.");
      }

      // result.data에서 LoginResponse 추출
      await login(result.data as LoginResponse);
      router.push("/");
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

  // 이미 로그인된 경우
  if (isAuthenticated) {
    return null;
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