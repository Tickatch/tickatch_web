"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import LoginCard from "@/components/auth/LoginCard";
import { LoginResponse } from "@/types/auth";
import { getApiUrl, API_CONFIG } from "@/lib/api-client";
import { useAuth } from "@/providers/AuthProvider";

export default function AdminLoginPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    isLoading: authLoading,
    login,
    userType,
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이미 로그인된 경우 리다이렉트
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (userType === "ADMIN") {
        router.replace("/admin");
      } else {
        setError("관리자 계정으로 로그인해주세요.");
      }
    }
  }, [authLoading, isAuthenticated, userType, router]);

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

      const data: LoginResponse = await response.json();
      await login(data);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && userType === "ADMIN") {
    return null;
  }

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
