import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  nickname: string;
}

interface AuthContextType {
  user: User | null;
  userType: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (response: LoginResponse) => Promise<void>;
  logout: () => Promise<void>;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userType: string;
  nickname?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 토큰 저장 (메모리 + 쿠키)
  const accessTokenRef = useRef<string | null>(null);
  const refreshTokenRef = useRef<string | null>(null);

  // 토큰 갱신 함수
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (!refreshTokenRef.current) return null;

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refreshTokenRef.current }),
      });

      if (!response.ok) return null;

      const data = await response.json();

      // 새 토큰 저장
      accessTokenRef.current = data.accessToken;
      refreshTokenRef.current = data.refreshToken;

      // 쿠키에도 저장 (서버 API Route 통해)
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      return data.accessToken;
    } catch {
      return null;
    }
  }, []);

  // 로그아웃 처리
  const handleAuthError = useCallback(() => {
    accessTokenRef.current = null;
    refreshTokenRef.current = null;
    setUser(null);
    setUserType(null);

    fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }, [router]);

  // API Client에 핸들러 등록
  useEffect(() => {
    api.setAuthHandlers({
      getAccessToken: () => accessTokenRef.current,
      refreshToken: refreshAccessToken,
      onAuthError: handleAuthError,
    });
  }, [refreshAccessToken, handleAuthError]);

  // 초기 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (data.user) {
          setUser(data.user);
          setUserType(data.userType);
          accessTokenRef.current = data.accessToken;
          refreshTokenRef.current = data.refreshToken;
        }
      } catch {
        // 무시
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 로그인
  const login = useCallback(async (response: LoginResponse) => {
    accessTokenRef.current = response.accessToken;
    refreshTokenRef.current = response.refreshToken;
    setUserType(response.userType);

    // 쿠키에 저장
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    });

    // 사용자 정보 조회
    try {
      const user = await api.get<User>("/auth/me");
      setUser(user);
    } catch {
      // 에러 시 기본 정보만
      setUser({ id: "", email: "", nickname: response.nickname || "" });
    }
  }, []);

  // 로그아웃
  const logout = useCallback(async () => {
    accessTokenRef.current = null;
    refreshTokenRef.current = null;
    setUser(null);
    setUserType(null);

    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }, [router]);

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
