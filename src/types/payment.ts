/**
 * 결제(Payment) 관련 타입 정의
 * (백엔드 Payment Service와 동기화)
 */

// ========== Enums ==========

/** 결제 상태 */
export type PaymentStatus =
    | "PENDING"     // 결제 대기
    | "COMPLETED"   // 결제 완료
    | "FAILED"      // 결제 실패
    | "CANCELED"    // 결제 취소
    | "REFUNDED";   // 환불됨

/** 결제 수단 */
export type PaymentMethod =
    | "CARD"        // 카드
    | "TRANSFER"    // 계좌이체
    | "VIRTUAL"     // 가상계좌
    | "PHONE"       // 휴대폰
    | "TOSS_PAY"    // 토스페이
    | "KAKAO_PAY"   // 카카오페이
    | "NAVER_PAY";  // 네이버페이

// ========== Labels ==========

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "결제 대기",
  COMPLETED: "결제 완료",
  FAILED: "결제 실패",
  CANCELED: "결제 취소",
  REFUNDED: "환불됨",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CARD: "카드",
  TRANSFER: "계좌이체",
  VIRTUAL: "가상계좌",
  PHONE: "휴대폰",
  TOSS_PAY: "토스페이",
  KAKAO_PAY: "카카오페이",
  NAVER_PAY: "네이버페이",
};

// ========== Request DTOs ==========

/** 결제 요청 (예매용) */
export interface PaymentRequest {
  /** 상품 ID */
  productId: number;
  /** 선택한 좌석 ID 목록 */
  seatIds: number[];
  /** 총 결제 금액 */
  amount: number;
  /** 주문명 (예: "뮤지컬 위키드 - A1, A2") */
  orderName: string;
  /** 결제 수단 (선택) */
  method?: PaymentMethod;
}

/** 결제 확정 요청 */
export interface PaymentConfirmRequest {
  /** 결제 키 (토스에서 받은 paymentKey) */
  paymentKey: string;
  /** 주문 ID */
  orderId: string;
  /** 결제 금액 */
  amount: number;
}

// ========== Response DTOs ==========

/** 결제 응답 */
export interface PaymentResponse {
  /** 결제 ID */
  paymentId: string;
  /** 주문 ID */
  orderId: string;
  /** 결제 상태 */
  status: PaymentStatus;
  /** 결제창 URL (있으면 팝업으로 열기) */
  checkoutUrl?: string;
  /** 결제 금액 */
  amount: number;
  /** 메시지 */
  message?: string;
}

/** 결제 확정 응답 */
export interface PaymentConfirmResponse {
  /** 결제 ID */
  paymentId: string;
  /** 주문 ID */
  orderId: string;
  /** 결제 키 */
  paymentKey: string;
  /** 예매 ID */
  reservationId: string;
  /** 결제 상태 */
  status: PaymentStatus;
  /** 결제 금액 */
  amount: number;
  /** 결제 완료 시간 */
  approvedAt: string;
}

/** 결제 내역 응답 */
export interface PaymentHistoryResponse {
  paymentId: string;
  orderId: string;
  orderName: string;
  amount: number;
  status: PaymentStatus;
  method?: PaymentMethod;
  createdAt: string;
  approvedAt?: string;
}

// ========== 유틸리티 ==========

/** 결제 상태별 색상 */
export function getPaymentStatusColor(status: PaymentStatus): string {
  switch (status) {
    case "PENDING":
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "COMPLETED":
      return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
    case "FAILED":
      return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
    case "CANCELED":
      return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400";
    case "REFUNDED":
      return "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

/** 주문 ID 생성 */
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ORDER_${timestamp}_${random}`.toUpperCase();
}