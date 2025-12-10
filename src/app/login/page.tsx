"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import LoginCard from "@/components/auth/LoginCard";
import { ProviderType, LoginResponse } from "@/types/auth";
import { getApiUrl, API_CONFIG } from "@/lib/api-config";
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
        await login(response); // AuthProvider의 login 사용
        router.push("/");
      } catch (err) {
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

  // OAuth 취소 핸들러 (팝업 수동 닫힘)
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
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LOGIN), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          userType: "CUSTOMER",
          rememberMe,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "로그인에 실패했습니다.");
      }

      const data: LoginResponse = await response.json();
      await login(data); // AuthProvider의 login 사용
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // OAuth 로그인 핸들러 (팝업 방식)
  const handleOAuthLogin = (provider: ProviderType) => {
    setError(null);
    setIsOAuthLoading(true);
    openOAuthPopup(provider, false);
  };

  // 인증 로딩 중이면 로딩 표시
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 이미 로그인된 경우 렌더링하지 않음 (리다이렉트 대기)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="CUSTOMER" />

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
