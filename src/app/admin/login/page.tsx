"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import LoginCard from "@/components/auth/LoginCard";
import { getApiUrl, API_CONFIG } from "@/lib/api-config";

export default function AdminLoginPage() {
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
          userType: "ADMIN",
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

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="ADMIN" />

      <main className="flex-1 flex items-center justify-center p-4">
        <LoginCard
          userType="ADMIN"
          onLogin={handleLogin}
          isLoading={isLoading}
          error={error}
        />
      </main>
    </div>
  );
}
