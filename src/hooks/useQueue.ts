// hooks/useQueue.ts
"use client";

import { useEffect, useCallback } from "react";
import { useQueueContext } from "@/providers/QueueProvider";
import { UseQueueReturn } from "@/types/queue";

/**
 * 대기열 관리 훅 (QueueProvider 기반)
 * @param isActive 대기열 활성화 여부 (모달이 열려있고 인증된 상태)
 */
export function useQueue(isActive: boolean): UseQueueReturn {
  const {
    state,
    status,
    error,
    isLoading,
    isReady,
    startQueue,
    stopQueue,
    reset: contextReset,
  } = useQueueContext();

  /**
   * isActive가 true가 되면 대기열 시작
   */
  useEffect(() => {
    if (isActive && state === "idle") {
      startQueue();
    }
  }, [isActive, state, startQueue]);

  /**
   * 대기열 초기화 (모달 닫기 등)
   */
  const reset = useCallback(() => {
    console.log("[useQueue] reset 호출");
    stopQueue();
  }, [stopQueue]);

  /**
   * 수동 새로고침 (재연결)
   */
  const refresh = useCallback(async () => {
    console.log("[useQueue] refresh 호출");
    contextReset();
    // 약간의 딜레이 후 재시작
    await new Promise((resolve) => setTimeout(resolve, 100));
    await startQueue();
  }, [contextReset, startQueue]);

  return {
    isReady,
    isLoading,
    status,
    error,
    reset,
    refresh,
  };
}

/**
 * 예약 페이지용 대기열 검증 훅
 * SSE 연결을 유지하면서 입장 가능 여부만 확인
 */
export function useQueueVerification() {
  const { state, isReady, checkQueueStatus, stopQueue } = useQueueContext();

  return {
    /** 입장 가능 여부 */
    isVerified: isReady,
    /** 현재 대기열 상태 */
    queueState: state,
    /** 상태 확인 함수 */
    checkStatus: checkQueueStatus,
    /** 대기열 종료 (예매 완료 후 호출) */
    completeQueue: stopQueue,
  };
}