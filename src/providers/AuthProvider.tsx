"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api-client";
import { LoginResponse, UserType } from "@/types/auth";

// 사용자 정보 (프론트엔드용)
interface User {
  id: string;
  email: string;
  nickname: string;
}

// 인증 컨텍스트 타입
interface AuthContextType {
  user: User | null;
  userType: UserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (response: LoginResponse) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 경로에서 유저 타입 추론
function getUserTypeFromPath(pathname: string): UserType {
  if (pathname.startsWith("/admin")) return "ADMIN";
  if (pathname.startsWith("/seller")) return "SELLER";
  return "CUSTOMER";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 메모리에 access token만 저장 (refresh token은 쿠키에서 경로별로 관리)
  const accessTokenRef = useRef<string | null>(null);

  // 토큰 갱신 함수 (경로 기반으로 적절한 refresh token 사용)
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      // 현재 경로를 헤더로 전달 → 서버에서 해당 경로의 refresh token 사용
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
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

  // 로그아웃 처리 (인증 에러 시)
  const handleAuthError = useCallback(() => {
    const currentUserType = getUserTypeFromPath(pathname);

    accessTokenRef.current = null;
    setUser(null);
    setUserType(null);

    // 해당 경로의 토큰만 삭제
    fetch(`/api/auth/logout?userType=${currentUserType}`, { method: "POST" });

    // userType에 따라 적절한 로그인 페이지로 리다이렉트
    if (currentUserType === "ADMIN") {
      router.push("/admin/login");
    } else if (currentUserType === "SELLER") {
      router.push("/seller/login");
    } else {
      router.push("/login");
    }
  }, [router, pathname]);

  // API Client에 핸들러 등록
  useEffect(() => {
    api.setAuthHandlers({
      getAccessToken: () => accessTokenRef.current,
      refreshToken: refreshAccessToken,
      onAuthError: handleAuthError,
    });
  }, [refreshAccessToken, handleAuthError]);

  // 경로 변경 시 해당 경로의 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);

      try {
        // 현재 경로를 헤더로 전달
        const response = await fetch("/api/auth/me", {
          headers: {
            "X-Current-Path": pathname,
          },
        });

        // 401 에러면 해당 경로의 refresh token으로 갱신 시도
        if (response.status === 401) {
          const newToken = await refreshAccessToken();

          if (newToken) {
            // refresh 성공 시 다시 me 호출
            const retryResponse = await fetch("/api/auth/me", {
              headers: {
                "X-Current-Path": pathname,
              },
            });
            const retryData = await retryResponse.json();

            if (retryData.user) {
              setUser(retryData.user);
              setUserType(retryData.userType);
              accessTokenRef.current = retryData.accessToken;
              return;
            }
          }
          // refresh 실패 시 비로그인 상태로
          setUser(null);
          setUserType(null);
          return;
        }

        const data = await response.json();

        if (data.user) {
          setUser(data.user);
          setUserType(data.userType);
          accessTokenRef.current = data.accessToken;
        } else {
          setUser(null);
          setUserType(null);
        }
      } catch {
        setUser(null);
        setUserType(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, refreshAccessToken]);

  // 로그인 (LoginResponse를 받아서 처리)
  const login = useCallback(async (response: LoginResponse) => {
    accessTokenRef.current = response.accessToken;
    setUserType(response.userType);

    // 쿠키에 저장 (서버 API Route 통해)
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    });

    // 사용자 정보 설정
    setUser({
      id: response.authId,
      email: response.email,
      nickname: response.email.split("@")[0],
    });
  }, []);

  // 로그아웃
  const logout = useCallback(async () => {
    const currentUserType = getUserTypeFromPath(pathname);

    accessTokenRef.current = null;
    setUser(null);
    setUserType(null);

    await fetch(`/api/auth/logout?userType=${currentUserType}`, { method: "POST" });

    // userType에 따라 적절한 페이지로 리다이렉트
    if (currentUserType === "ADMIN") {
      router.push("/admin/login");
    } else if (currentUserType === "SELLER") {
      router.push("/seller/login");
    } else {
      router.push("/");
    }
  }, [router, pathname]);

  return (
      <AuthContext.Provider
          value={{
            user,
            userType,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
          }}
      >
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}