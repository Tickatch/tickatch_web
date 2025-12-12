// hooks/useQueue.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { QueueStatusResponse, UseQueueReturn } from "@/types/queue";

const POLLING_INTERVAL = 1000; // 1초

/**
 * 대기열 관리 훅
 * @param isAuthenticated 로그인 여부
 */
export function useQueue(isAuthenticated: boolean): UseQueueReturn {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<QueueStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
      return false;
    }
  }, []);

  /**
   * 대기열 상태 확인 (status)
   */
  const checkStatus = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/queue/status", {
        method: "GET",
        credentials: "include",
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error?.message || "상태 확인 실패");
      }

      // 입장 가능: message가 "입장 가능합니다."이고 data가 null
      if (result.message === "입장 가능합니다." && !result.data) {
        setStatus(null);
        return true;
      }

      // 대기 중: data에 상태 정보
      if (result.data) {
        setStatus(result.data);
      }

      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : "상태 확인 중 오류 발생";
      setError(message);
      return false;
    }
  }, []);

  /**
   * 폴링 시작
   */
  const startPolling = useCallback(() => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(async () => {
      const canEnter = await checkStatus();
      if (canEnter) {
        setIsReady(true);
        setIsLoading(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, POLLING_INTERVAL);
  }, [checkStatus]);

  /**
   * 폴링 중지
   */
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * 초기화
   */
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      setError("로그인이 필요합니다.");
      return;
    }

    const init = async () => {
      setIsLoading(true);
      setError(null);

      // 대기열 등록
      const registered = await lineup();

      if (!registered) {
        setIsLoading(false);
        return;
      }

      // 최초 상태 확인
      const canEnter = await checkStatus();
      if (canEnter) {
        setIsReady(true);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        startPolling();
      }
    };

    init();

    return () => {
      stopPolling();
    };
  }, [isAuthenticated, lineup, checkStatus, startPolling, stopPolling]);

  /**
   * 대기열 초기화
   */
  const reset = useCallback(() => {
    setIsReady(false);
    setStatus(null);
    setError(null);
    stopPolling();
  }, [stopPolling]);

  /**
   * 수동 새로고침
   */
  const refresh = useCallback(async () => {
    const canEnter = await checkStatus();
    if (canEnter) {
      setIsReady(true);
      stopPolling();
    }
  }, [checkStatus, stopPolling]);

  return {
    isReady,
    isLoading,
    status,
    error,
    reset,
    refresh,
  };
}