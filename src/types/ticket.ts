/**
 * 티켓(Ticket) 관련 타입 정의
 * (백엔드 Ticket Service와 동기화)
 */

// ========== Enums ==========

/** 티켓 상태 */
export type TicketStatus =
    | "ISSUED"    // 발행됨
    | "USED"      // 사용됨
    | "CANCELED"  // 취소됨
    | "EXPIRED";  // 만료됨

/** 수령 방법 */
export type ReceiveMethod = "ON_SITE";  // 현장 수령

// ========== Labels ==========

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  ISSUED: "발행됨",
  USED: "사용됨",
  CANCELED: "취소됨",
  EXPIRED: "만료됨",
};

export const RECEIVE_METHOD_LABELS: Record<ReceiveMethod, string> = {
  ON_SITE: "현장 수령",
};

// ========== Request DTOs ==========

/** 티켓 생성 요청 */
export interface CreateTicketRequest {
  reservationId: string;  // UUID
  seatId: number;
  productId: number;
  seatNumber: string;
  grade: string;
  price: number | null;
  receiveMethod: ReceiveMethod;
}

// ========== Response DTOs ==========

/** 티켓 응답 (목록용) */
export interface TicketResponse {
  id: string;           // UUID
  seatNumber: string;
  grade: string;
  price: number | null;
  status: TicketStatus;
}

/** 티켓 상세 응답 */
export interface TicketDetailResponse {
  id: string;           // UUID
  reservationId: string; // UUID
  seatId: number;
  seatNumber: string;
  grade: string;
  price: number | null;
  status: TicketStatus;
}

/** 티켓 액션 응답 (사용/취소 시) */
export interface TicketActionResponse {
  id: string;           // UUID
  status: string;
  usedAt: string | null;      // ISO DateTime
  canceledAt: string | null;  // ISO DateTime
}

// ========== 유틸리티 ==========

/** 티켓 상태별 색상 */
export function getTicketStatusColor(status: TicketStatus): string {
  switch (status) {
    case "ISSUED":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "USED":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "CANCELED":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "EXPIRED":
      return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/** 티켓 사용 가능 여부 */
export function canUseTicket(status: TicketStatus): boolean {
  return status === "ISSUED";
}

/** 티켓 취소 가능 여부 */
export function canCancelTicket(status: TicketStatus): boolean {
  return status === "ISSUED";
}