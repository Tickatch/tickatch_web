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
    if (!authLoading && isAuthenticated) {
      if (userType === "SELLER") {
        // 판매자 정보가 있는지 확인
        checkSellerProfile();
      } else {
        setError("판매자 계정으로 로그인해주세요.");
      }
    }
  }, [authLoading, isAuthenticated, userType]);

  // 판매자 프로필 확인
  const checkSellerProfile = async () => {
    try {
      const response = await fetch("/api/user/sellers/me");

      if (response.ok) {
        // 판매자 정보가 있으면 판매자 페이지로
        router.replace("/seller");
      } else if (response.status === 404) {
        // 판매자 정보가 없으면 프로필 완성 페이지로
        router.replace("/seller/complete-profile");
      } else {
        // 기타 에러
        router.replace("/seller");
      }
    } catch {
      // 에러 발생 시 일단 판매자 페이지로
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

      // 3. 판매자 정보 확인
      const meResponse = await fetch("/api/user/sellers/me");

      if (meResponse.ok) {
        // 판매자 정보가 있으면 판매자 페이지로
        router.push("/seller");
      } else if (meResponse.status === 404) {
        // 판매자 정보가 없으면 프로필 완성 페이지로
        router.push("/seller/complete-profile");
      } else {
        // 기타 에러는 일단 판매자 페이지로
        router.push("/seller");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
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