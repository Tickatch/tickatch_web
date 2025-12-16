// src/providers/AuthProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { LoginResponse, UserType } from "@/types/auth";

interface User {
  id: string;
  email: string;
  nickname: string;
}

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

  // 현재 경로에 맞는 인증 상태 확인
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          // Referer가 자동으로 전송되지만 명시적으로 현재 경로 전달
          "X-Current-Path": pathname,
        },
      });
      const data = await response.json();

      if (data.isAuthenticated && data.user) {
        setUser(data.user);
        setUserType(data.userType);
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
  }, [pathname]);

  // 경로 변경 시 해당 경로의 인증 상태 확인
  useEffect(() => {
    setIsLoading(true);
    checkAuth();
  }, [checkAuth]);

  // 로그인
  const login = useCallback(async (response: LoginResponse) => {
    setUserType(response.userType);

    // 사용자 정보 설정
    setUser({
      id: response.authId,
      email: response.email,
      nickname: response.email.split("@")[0],
    });
  }, []);

  // 로그아웃 (현재 경로의 유저 타입으로)
  const logout = useCallback(async () => {
    const currentUserType = getUserTypeFromPath(pathname);

    await fetch(`/api/auth/logout?userType=${currentUserType}`, {
      method: "POST",
    });

    setUser(null);
    setUserType(null);

    // 역할별 리다이렉트
    if (currentUserType === "ADMIN") {
      router.push("/admin/login");
    } else if (currentUserType === "SELLER") {
      router.push("/seller/login");
    } else {
      router.push("/");
    }
  }, [pathname, router]);

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