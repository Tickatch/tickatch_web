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

// ============================================
// 모듈 레벨 전역 변수 (싱글톤)
// ============================================
let globalAuthChecked = false;
let globalAuthPromise: Promise<void> | null = null;
let globalUser: User | null = null;
let globalAccessToken: string | null = null;
let globalIsAuthenticated = false;

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
 */
export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const currentUserType = getUserTypeFromPath(pathname);

  const [user, setUser] = useState<User | null>(globalUser);
  const [isLoading, setIsLoading] = useState(!globalAuthChecked);
  const [isAuthenticated, setIsAuthenticated] = useState(globalIsAuthenticated);

  // 현재 경로 저장 (ref로 관리)
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // 토큰 getter
  const getAccessToken = useCallback(() => {
    return globalAccessToken;
  }, []);

  // 토큰 refresh
  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Current-Path": pathnameRef.current,
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      globalAccessToken = data.accessToken;
      return data.accessToken;
    } catch {
      return null;
    }
  }, []);

  // 인증 에러 핸들러
  const handleAuthError = useCallback(() => {
    globalAccessToken = null;
    globalUser = null;
    globalIsAuthenticated = false;
    globalAuthChecked = false;

    setUser(null);
    setIsAuthenticated(false);

    const userType = getUserTypeFromPath(pathnameRef.current);
    if (userType === "ADMIN") {
      router.push("/admin/login");
    } else if (userType === "SELLER") {
      router.push("/seller/login");
    } else {
      router.push("/login");
    }
  }, [router]);

  // api-client에 핸들러 등록
  useEffect(() => {
    api.setAuthHandlers({
      getAccessToken,
      refreshToken,
      onAuthError: handleAuthError,
    });
  }, [getAccessToken, refreshToken, handleAuthError]);

  // 인증 체크 (전역에서 1회만 실행)
  useEffect(() => {
    // 이미 체크 완료된 경우 전역 상태 동기화만
    if (globalAuthChecked) {
      setUser(globalUser);
      setIsAuthenticated(globalIsAuthenticated);
      setIsLoading(false);
      return;
    }

    // 이미 진행 중인 요청이 있으면 그 결과를 기다림
    if (globalAuthPromise) {
      globalAuthPromise.then(() => {
        setUser(globalUser);
        setIsAuthenticated(globalIsAuthenticated);
        setIsLoading(false);
      });
      return;
    }

    const checkAuth = async () => {
      try {
        // 1차: me 요청
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          headers: {
            "X-Current-Path": pathnameRef.current,
          },
        });

        // 성공
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            globalUser = data.user;
            globalAccessToken = data.accessToken;
            globalIsAuthenticated = true;

            setUser(data.user);
            setIsAuthenticated(true);
            return;
          }
        }

        // 401: refresh 시도
        if (response.status === 401) {
          const newToken = await refreshToken();

          if (newToken) {
            const retryResponse = await fetch("/api/auth/me", {
              credentials: "include",
              headers: {
                "X-Current-Path": pathnameRef.current,
              },
            });

            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              if (retryData.user) {
                globalUser = retryData.user;
                globalAccessToken = retryData.accessToken;
                globalIsAuthenticated = true;

                setUser(retryData.user);
                setIsAuthenticated(true);
                return;
              }
            }
          }
        }

        // 인증 실패
        globalUser = null;
        globalAccessToken = null;
        globalIsAuthenticated = false;

        setUser(null);
        setIsAuthenticated(false);
      } catch {
        globalUser = null;
        globalAccessToken = null;
        globalIsAuthenticated = false;

        setUser(null);
        setIsAuthenticated(false);
      } finally {
        globalAuthChecked = true;
        globalAuthPromise = null;
        setIsLoading(false);
      }
    };

    // Promise 저장하여 중복 요청 방지
    globalAuthPromise = checkAuth();
  }, [refreshToken]);

  // 로그인
  const login = useCallback(async (response: LoginResponse) => {
    await fetch("/api/auth/session", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    });

    globalAccessToken = response.accessToken;
    globalIsAuthenticated = true;
    globalUser = {
      id: response.authId,
      email: response.email,
      nickname: response.email.split("@")[0],
    };

    setIsAuthenticated(true);
    setUser(globalUser);
  }, []);

  // 로그아웃
  const logout = useCallback(async () => {
    const userType = getUserTypeFromPath(pathnameRef.current);

    await fetch(`/api/auth/logout?userType=${userType}`, {
      method: "POST",
      credentials: "include",
    });

    globalAccessToken = null;
    globalUser = null;
    globalIsAuthenticated = false;
    globalAuthChecked = false;

    setUser(null);
    setIsAuthenticated(false);

    if (userType === "ADMIN") {
      router.push("/admin/login");
    } else if (userType === "SELLER") {
      router.push("/seller/login");
    } else {
      router.push("/");
    }
  }, [router]);

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