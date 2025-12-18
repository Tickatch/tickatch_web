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

/** 환불 사유 */
export type RefundReason =
    | "USER_REQUEST"    // 사용자 요청
    | "ADMIN_REQUEST"   // 관리자 요청
    | "SYSTEM_ERROR"    // 시스템 오류
    | "EVENT_CANCELED"; // 행사 취소

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

export const REFUND_REASON_LABELS: Record<RefundReason, string> = {
  USER_REQUEST: "사용자 요청",
  ADMIN_REQUEST: "관리자 요청",
  SYSTEM_ERROR: "시스템 오류",
  EVENT_CANCELED: "행사 취소",
};

// ========== Request DTOs ==========

/** 결제 항목 (개별) */
export interface PaymentItem {
  reservationId: string;   // UUID
  price: number;
}

/** 결제 생성 요청 - CreatePaymentRequest */
export interface CreatePaymentRequest {
  payments: PaymentItem[];
}

/** 환불 요청 - RefundPaymentRequest */
export interface RefundPaymentRequest {
  reason: RefundReason | string;
  reservationIds: string[];  // UUID[]
}

// ========== Response DTOs ==========

/** 결제 성공 콜백 파라미터 */
export interface PaymentSuccessParams {
  paymentKey: string;
  orderId: string;
  amount: number;
}

/** 결제 실패 콜백 파라미터 */
export interface PaymentFailParams {
  code: string;
  message?: string;
  orderId: string;
}

// ========== 프론트엔드용 (Toss Payments 연동) ==========

/** 토스 결제 요청 옵션 */
export interface TossPaymentRequestOptions {
  method: string;
  amount: { currency: string; value: number };
  orderId: string;
  orderName: string;
  customerName: string;
  successUrl: string;
  failUrl: string;
}

/** 결제 응답 (프론트용) */
export interface PaymentResponse {
  orderId: string;
  checkoutUrl?: string;
  message?: string;
}

/** 결제 확정 응답 (프론트용) */
export interface PaymentConfirmResponse {
  success: boolean;
  message?: string;
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

/** 주문 ID 생성 (UUID 형식) */
export function generateOrderId(): string {
  return crypto.randomUUID();
}