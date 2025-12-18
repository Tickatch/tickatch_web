"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginCard from "@/components/auth/LoginCard";
import { LoginResponse } from "@/types/auth";
import { useAuth } from "@/hooks/useAuth";

export default function SellerLoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, login, userType } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이미 로그인된 경우 리다이렉트
  useEffect(() => {
    if (!authLoading && isAuthenticated && userType === "SELLER") {
      checkSellerProfile();
    }
  }, [authLoading, isAuthenticated, userType]);

  // 판매자 프로필 확인
  const checkSellerProfile = async () => {
    try {
      const response = await fetch("/api/user/sellers/me");

      if (response.ok) {
        router.replace("/seller");
      } else if (response.status === 404) {
        router.replace("/seller/complete-profile");
      } else {
        router.replace("/seller");
      }
    } catch {
      router.replace("/seller");
    }
  };

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
          userType: "SELLER",
          rememberMe,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "로그인에 실패했습니다.");
      }

      // 2. 로그인 성공 - AuthProvider에 저장
      await login(result.data as LoginResponse);

      // 3. 판매자 정보 확인 후 리다이렉트
      const meResponse = await fetch("/api/user/sellers/me");

      if (meResponse.ok) {
        // 약간의 딜레이 후 리다이렉트 (상태 동기화 대기)
        setTimeout(() => {
          window.location.href = "/seller";
        }, 100);
      } else if (meResponse.status === 404) {
        setTimeout(() => {
          window.location.href = "/seller/complete-profile";
        }, 100);
      } else {
        setTimeout(() => {
          window.location.href = "/seller";
        }, 100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
      setIsLoading(false);
    }
    // 성공 시에는 setIsLoading(false)를 호출하지 않음 (페이지 전환 전까지 로딩 유지)
  };

  if (authLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  if (isAuthenticated && userType === "SELLER") {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">확인 중...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <main className="flex-1 flex items-center justify-center p-4">
          <LoginCard
              userType="SELLER"
              onLogin={handleLogin}
              isLoading={isLoading}
              error={error}
          />
        </main>
      </div>
  );
}