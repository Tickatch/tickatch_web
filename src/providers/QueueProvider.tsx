// providers/QueueProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import { QueueStatusResponse } from "@/types/queue";

// SSE 이벤트 타입
interface SSEStatusUpdateEvent {
  totalQueueSize: number;
  userQueuePosition: number;
  usersBehind: number;
}

interface SSEAllowedInEvent {
  message: string;
}

interface SSEErrorEvent {
  code: string;
  message: string;
}

// 대기열 상태
type QueueState = "idle" | "waiting" | "ready" | "error";

interface QueueContextType {
  /** 현재 대기열 상태 */
  state: QueueState;
  /** 대기열 상태 정보 (대기 중일 때) */
  status: QueueStatusResponse | null;
  /** 에러 메시지 */
  error: string | null;
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 입장 가능 여부 */
  isReady: boolean;
  /** 대기열 시작 (lineup + SSE 연결) */
  startQueue: () => Promise<void>;
  /** 대기열 종료 (SSE 연결 해제) */
  stopQueue: () => void;
  /** 대기열 상태 확인 (이미 입장 가능한지) */
  checkQueueStatus: () => Promise<boolean>;
  /** 전체 초기화 */
  reset: () => void;
}

const QueueContext = createContext<QueueContextType | null>(null);

export function useQueueContext() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error("useQueueContext must be used within QueueProvider");
  }
  return context;
}

interface QueueProviderProps {
  children: ReactNode;
}

export function QueueProvider({ children }: QueueProviderProps) {
  const [state, setState] = useState<QueueState>("idle");
  const [status, setStatus] = useState<QueueStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const isConnectedRef = useRef(false);
  // ✅ state를 ref로도 관리하여 클로저 문제 해결
  const stateRef = useRef<QueueState>(state);

  // state 변경 시 ref도 업데이트
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // 입장 가능 여부
  const isReady = state === "ready";

  /**
   * SSE 연결 종료
   */
  const closeConnection = useCallback(() => {
    if (eventSourceRef.current) {
      console.log("[QueueProvider] SSE 연결 종료");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      isConnectedRef.current = false;
    }
  }, []);

  /**
   * SSE 연결 시작
   */
  const connectSSE = useCallback(() => {
    if (isConnectedRef.current || eventSourceRef.current) {
      console.log("[QueueProvider] 이미 연결됨, 스킵");
      return;
    }

    console.log("[QueueProvider] SSE 연결 시작");
    isConnectedRef.current = true;

    const eventSource = new EventSource("/api/queue/stream", {
      withCredentials: true,
    });

    eventSourceRef.current = eventSource;

    // 상태 업데이트 이벤트
    eventSource.addEventListener("STATUS_UPDATE", (event) => {
      try {
        const data: SSEStatusUpdateEvent = JSON.parse(event.data);
        console.log("[QueueProvider] STATUS_UPDATE:", data);
        setStatus({
          totalQueueSize: data.totalQueueSize,
          userQueuePosition: data.userQueuePosition,
          usersBehind: data.usersBehind,
        });
        setState("waiting");
        setIsLoading(false);
      } catch (err) {
        console.error("[QueueProvider] STATUS_UPDATE 파싱 에러:", err);
      }
    });

    // 입장 허용 이벤트
    eventSource.addEventListener("ALLOWED_IN", (event) => {
      try {
        const data: SSEAllowedInEvent = JSON.parse(event.data);
        console.log("[QueueProvider] ALLOWED_IN:", data);
        setState("ready");
        setStatus(null);
        setIsLoading(false);
        // 입장 허용 후에도 연결 유지 (예약 페이지에서 검증용)
      } catch (err) {
        console.error("[QueueProvider] ALLOWED_IN 파싱 에러:", err);
      }
    });

    // 에러 이벤트
    eventSource.addEventListener("ERROR", (event) => {
      try {
        const data: SSEErrorEvent = JSON.parse(event.data);
        console.log("[QueueProvider] ERROR:", data);
        setError(data.message);
        setState("error");
        setIsLoading(false);
        closeConnection();
      } catch (err) {
        console.error("[QueueProvider] ERROR 파싱 에러:", err);
      }
    });

    // Heartbeat
    eventSource.addEventListener("HEARTBEAT", () => {
      console.log("[QueueProvider] HEARTBEAT");
    });

    // 연결 에러
    eventSource.onerror = (err) => {
      console.error("[QueueProvider] SSE 연결 에러:", err);
      if (eventSource.readyState === EventSource.CLOSED) {
        // ✅ stateRef 사용하여 최신 state 확인
        if (stateRef.current !== "ready") {
          setError("대기열 연결이 끊어졌습니다.");
          setState("error");
        }
        setIsLoading(false);
        closeConnection();
      }
    };

    eventSource.onopen = () => {
      console.log("[QueueProvider] SSE 연결 성공");
    };
  }, [closeConnection]);

  /**
   * 대기열 등록 (lineup)
   */
  const lineup = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/queue/lineup", {
        method: "POST",
        credentials: "include",
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error?.message || "대기열 진입 실패");
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "대기열 등록 중 오류 발생";
      setError(message);
      setState("error");
      return false;
    }
  }, []);

  /**
   * 대기열 상태 확인 (이미 입장 가능한지 체크)
   */
  const checkQueueStatus = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/queue/status", {
        method: "GET",
        credentials: "include",
      });

      const result = await res.json();

      if (!result.success) {
        return false;
      }

      // 입장 가능 확인
      if (result.message === "입장 가능합니다." && !result.data) {
        setState("ready");
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }, []);

  /**
   * 대기열 시작 (lineup + SSE)
   */
  const startQueue = useCallback(async () => {
    // ✅ stateRef 사용
    if (stateRef.current === "waiting" || stateRef.current === "ready") {
      console.log("[QueueProvider] 이미 대기열 진행 중");
      return;
    }

    setIsLoading(true);
    setError(null);
    setState("idle");

    // 1. 대기열 등록
    const registered = await lineup();

    if (!registered) {
      setIsLoading(false);
      return;
    }

    // 2. SSE 연결
    connectSSE();
  }, [lineup, connectSSE]);

  /**
   * 대기열 종료
   */
  const stopQueue = useCallback(() => {
    console.log("[QueueProvider] stopQueue 호출");
    closeConnection();
    setState("idle");
    setStatus(null);
    setError(null);
    setIsLoading(false);
  }, [closeConnection]);

  /**
   * 전체 초기화
   */
  const reset = useCallback(() => {
    console.log("[QueueProvider] reset 호출");
    closeConnection();
    setState("idle");
    setStatus(null);
    setError(null);
    setIsLoading(false);
  }, [closeConnection]);

  /**
   * 페이지 이탈 시 연결 종료
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log("[QueueProvider] beforeunload");
      closeConnection();
    };

    const handlePageHide = () => {
      console.log("[QueueProvider] pagehide");
      closeConnection();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
      closeConnection();
    };
  }, [closeConnection]);

  return (
      <QueueContext.Provider
          value={{
            state,
            status,
            error,
            isLoading,
            isReady,
            startQueue,
            stopQueue,
            checkQueueStatus,
            reset,
          }}
      >
        {children}
      </QueueContext.Provider>
  );
}