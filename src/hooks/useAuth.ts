"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LoginResponse, UserType } from "@/types/auth";
import { api } from "@/lib/api-client";

// 사용자 정보
interface User {
  id: string;
  email: string;
  nickname: string;
}

// 경로에서 유저 타입 추론
function getUserTypeFromPath(pathname: string): UserType {
  if (pathname.startsWith("/admin")) return "ADMIN";
  if (pathname.startsWith("/seller")) return "SELLER";
  return "CUSTOMER";
}

// 쿠키에서 값 가져오기 (클라이언트)
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

/**
 * 인증 관련 훅
 * - 페이지 로드 시 /api/auth/me로 인증 검증
 * - 401 시 refresh 시도
 * - 실패 시 로그인 페이지로 리다이렉트
 */
export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const currentUserType = getUserTypeFromPath(pathname);

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 토큰 메모리 저장 (API 요청용)
  const accessTokenRef = useRef<string | null>(null);

  // 토큰 getter
  const getAccessToken = useCallback(() => {
    return accessTokenRef.current;
  }, []);

  // 토큰 refresh
  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Current-Path": pathname,
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      accessTokenRef.current = data.accessToken;
      return data.accessToken;
    } catch {
      return null;
    }
  }, [pathname]);

  // 인증 에러 핸들러 (로그인 페이지로 이동)
  const handleAuthError = useCallback(() => {
    accessTokenRef.current = null;
    setUser(null);
    setIsAuthenticated(false);

    if (currentUserType === "ADMIN") {
      router.push("/admin/login");
    } else if (currentUserType === "SELLER") {
      router.push("/seller/login");
    } else {
      router.push("/login");
    }
  }, [router, currentUserType]);

  // api-client에 핸들러 등록
  useEffect(() => {
    api.setAuthHandlers({
      getAccessToken,
      refreshToken,
      onAuthError: handleAuthError,
    });
  }, [getAccessToken, refreshToken, handleAuthError]);

  // 인증 체크 (me 요청)
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);

      try {
        // 1차: me 요청
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          headers: {
            "X-Current-Path": pathname,
          },
        });

        // 성공
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
            setIsAuthenticated(true);
            accessTokenRef.current = data.accessToken;
            setIsLoading(false);
            return;
          }
        }

        // 401: refresh 시도
        if (response.status === 401) {
          const newToken = await refreshToken();

          if (newToken) {
            // refresh 성공 → me 재요청
            const retryResponse = await fetch("/api/auth/me", {
              credentials: "include",
              headers: {
                "X-Current-Path": pathname,
              },
            });

            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              if (retryData.user) {
                setUser(retryData.user);
                setIsAuthenticated(true);
                accessTokenRef.current = retryData.accessToken;
                setIsLoading(false);
                return;
              }
            }
          }
        }

        // 인증 실패
        setUser(null);
        setIsAuthenticated(false);
        accessTokenRef.current = null;
      } catch {
        setUser(null);
        setIsAuthenticated(false);
        accessTokenRef.current = null;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, refreshToken]);

  // 로그인 (쿠키에 토큰 저장)
  const login = useCallback(async (response: LoginResponse) => {
    await fetch("/api/auth/session", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    });

    accessTokenRef.current = response.accessToken;
    setIsAuthenticated(true);
    setUser({
      id: response.authId,
      email: response.email,
      nickname: response.email.split("@")[0],
    });
  }, []);

  // 로그아웃 (쿠키 삭제 + 리다이렉트)
  const logout = useCallback(async () => {
    await fetch(`/api/auth/logout?userType=${currentUserType}`, {
      method: "POST",
      credentials: "include",
    });

    accessTokenRef.current = null;
    setUser(null);
    setIsAuthenticated(false);

    if (currentUserType === "ADMIN") {
      router.push("/admin/login");
    } else if (currentUserType === "SELLER") {
      router.push("/seller/login");
    } else {
      router.push("/");
    }
  }, [router, currentUserType]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    userType: currentUserType,
  };
}

/**
 * 특정 유저 타입의 로그인 상태 확인 (쿠키 기반, UI용)
 */
export function isLoggedInAs(userType: UserType): boolean {
  const cookieName = `logged_in_${userType.toLowerCase()}`;
  return getCookie(cookieName) === "true";
}