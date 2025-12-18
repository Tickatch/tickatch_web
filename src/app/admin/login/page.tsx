"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginCard from "@/components/auth/LoginCard";
import { LoginResponse } from "@/types/auth";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, login, userType } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이미 로그인된 경우 리다이렉트
  useEffect(() => {
    if (!authLoading && isAuthenticated && userType === "ADMIN") {
      router.replace("/admin");
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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          userType: "ADMIN",
          rememberMe,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "로그인에 실패했습니다.");
      }

      await login(result.data as LoginResponse);

      // window.location.href로 전체 페이지 리로드
      setTimeout(() => {
        window.location.href = "/admin";
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
      setIsLoading(false);
    }
    // 성공 시에는 setIsLoading(false) 호출하지 않음
  };

  if (authLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  if (isAuthenticated && userType === "ADMIN") {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
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