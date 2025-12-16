/**
 * 예매(Reservation) 관련 타입 정의
 * (백엔드 Reservation Service와 동기화)
 */

// ========== Enums ==========

/** 예매 상태 */
export type ReservationStatus =
    | "INIT"             // 예매 최초 생성
    | "PENDING_PAYMENT"  // 결제 진행중
    | "CONFIRMED"        // 결제 승인(예매 확정)
    | "PAYMENT_FAILED"   // 결제 실패
    | "CANCELED"         // 사용자 취소
    | "EXPIRED";         // 예매 시간 만료로 인한 취소

// ========== Labels ==========

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  INIT: "예매 생성",
  PENDING_PAYMENT: "결제 진행중",
  CONFIRMED: "예매 확정",
  PAYMENT_FAILED: "결제 실패",
  CANCELED: "취소됨",
  EXPIRED: "만료됨",
};

// ========== Request DTOs ==========

/** 예매 생성 요청 */
export interface CreateReservationRequest {
  reserverId: string;      // UUID
  reserverName: string;
  productId: number;
  productName: string;
  seatId: number;
  seatNumber: string;
  price: number;
}

// ========== Response DTOs ==========

/** 예매 응답 (목록용) */
export interface ReservationResponse {
  id: string;              // UUID
  reserverId: string;      // UUID
  productId: number;
  seatId: number;
  price: number;
}

/** 예매 상세 응답 */
export interface ReservationDetailResponse {
  id: string;              // UUID
  reserverId: string;      // UUID
  reserverName: string;
  productId: number;
  productName: string;
  seatId: number;
  seatNumber: string;
  price: number;
  status: ReservationStatus;
}

/** 예매 확정 상태 응답 */
export interface ReservationConfirmedResponse {
  confirmed: boolean;
}

// ========== 유틸리티 ==========

/** 예매 상태별 색상 */
export function getReservationStatusColor(status: ReservationStatus): string {
  switch (status) {
    case "INIT":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    case "PENDING_PAYMENT":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "CONFIRMED":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "PAYMENT_FAILED":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "CANCELED":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    case "EXPIRED":
      return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/** 가격 포맷 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR").format(price);
}