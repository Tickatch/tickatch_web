"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import LoginCard from "@/components/auth/LoginCard";
import { ProviderType } from "@/types/auth";
import { getApiUrl, getOAuthLoginUrl, API_CONFIG } from "@/lib/api-config";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const data = await response.json();

      // 세션 저장 (서버 API로 토큰 전송)
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          userType: data.userType,
        }),
      });

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: ProviderType) => {
    // OAuth 로그인 - 백엔드로 리다이렉트
    window.location.href = getOAuthLoginUrl(provider, false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="CUSTOMER" />

      <main className="flex-1 flex items-center justify-center p-4">
        <LoginCard
          userType="CUSTOMER"
          onLogin={handleLogin}
          onOAuthLogin={handleOAuthLogin}
          isLoading={isLoading}
          error={error}
        />
      </main>
    </div>
  );
}
