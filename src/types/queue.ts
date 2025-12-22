// types/queue.ts

/**
 * 대기열 상태 응답 (백엔드 QueueStatusResponse와 동기화)
 */
export interface QueueStatusResponse {
  /** 총 대기 인원 */
  totalQueueSize: number;
  /** 사용자 대기번호 */
  userQueuePosition: number;
  /** 사용자 기준 뒤로 몇 명 */
  usersBehind: number;
}

/**
 * 대기열 등록 응답
 */
export interface LineUpResponse {
  queueToken: string;
}

/**
 * SSE 이벤트 타입들
 */
export type QueueSSEEventType =
    | "STATUS_UPDATE"
    | "ALLOWED_IN"
    | "ERROR"
    | "HEARTBEAT";

/**
 * SSE STATUS_UPDATE 이벤트 데이터
 */
export interface SSEStatusUpdateData {
  totalQueueSize: number;
  userQueuePosition: number;
  usersBehind: number;
}

/**
 * SSE ALLOWED_IN 이벤트 데이터
 */
export interface SSEAllowedInData {
  message: string;
}

/**
 * SSE ERROR 이벤트 데이터
 */
export interface SSEErrorData {
  code: string;
  message: string;
}

/**
 * SSE HEARTBEAT 이벤트 데이터
 */
export interface SSEHeartbeatData {
  timestamp: number;
}

/**
 * 대기열 훅 반환 타입
 */
export interface UseQueueReturn {
  /** 입장 가능 여부 */
  isReady: boolean;
  /** 로딩 중 여부 (초기 연결 중) */
  isLoading: boolean;
  /** 대기열 상태 정보 */
  status: QueueStatusResponse | null;
  /** 에러 메시지 */
  error: string | null;
  /** 대기열 초기화 (연결 종료) */
  reset: () => void;
  /** 수동으로 재연결 */
  refresh: () => Promise<void>;
}