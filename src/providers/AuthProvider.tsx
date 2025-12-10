"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { AuthInfo, UserType, LoginResponse } from "@/types/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthInfo | null;
  userType: UserType | null;
  isLoading: boolean;
  login: (response: LoginResponse) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthInfo | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 인증 상태 확인 (서버에서 쿠키 기반으로 확인)
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setUserType(data.userType);
      } else {
        setUser(null);
        setUserType(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setUserType(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 로그인 처리 (토큰을 서버 API로 전송하여 쿠키에 저장)
  const login = async (response: LoginResponse) => {
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          userType: response.userType,
        }),
        credentials: "include",
      });

      if (res.ok) {
        await checkAuth();
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  // 로그아웃 처리
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setUserType(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        userType,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
