/**
 * 예매 좌석(ReservationSeat) 관련 타입 정의
 * (백엔드 ReservationSeat Service와 동기화)
 */

// ========== Enums ==========

/** 예매 좌석 상태 */
export type ReservationSeatStatus =
    | "AVAILABLE"   // 예매 가능
    | "PREEMPTED"   // 선점됨 (임시)
    | "RESERVED"    // 예약 확정
    | "CANCELED";   // 취소됨

// ========== Labels ==========

export const RESERVATION_SEAT_STATUS_LABELS: Record<ReservationSeatStatus, string> = {
  AVAILABLE: "예매 가능",
  PREEMPTED: "선점 중",
  RESERVED: "예약 완료",
  CANCELED: "취소됨",
};

// ========== Response DTOs ==========

/** 예매 좌석 응답 */
export interface ReservationSeatResponse {
  id: number;
  seatNumber: string;
  grade: string;
  price: number;
  status: ReservationSeatStatus;
}

// ========== Request DTOs ==========

/** 예매 좌석 생성 정보 (단일) */
export interface ReservationSeatCreateInfo {
  seatNumber: string;
  grade: string;
  price: number;
}

/** 예매 좌석 생성 요청 (벌크) */
export interface ReservationSeatsCreateRequest {
  productId: number;
  seatCreateInfos: ReservationSeatCreateInfo[];
}

/** 예매 좌석 정보 수정 요청 (단일) */
export interface ReservationSeatInfoUpdateRequest {
  reservationSeatId: number;
  grade: string;
  price: number;
}

/** 예매 좌석 정보 수정 요청 (벌크) */
export interface ReservationSeatInfosUpdateRequest {
  seatInfos: ReservationSeatInfoUpdateRequest[];
}

// ========== 유틸리티 ==========

/** 예매 좌석 상태별 색상 */
export function getReservationSeatStatusColor(status: ReservationSeatStatus): string {
  switch (status) {
    case "AVAILABLE":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "PREEMPTED":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "RESERVED":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "CANCELED":
      return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/** 등급별 텍스트 색상 */
export function getGradeColor(grade: string): string {
  const gradeUpper = grade.toUpperCase();
  switch (gradeUpper) {
    case "VIP":
    case "VVIP":
      return "text-purple-600 dark:text-purple-400";
    case "R":
    case "ROYAL":
      return "text-amber-600 dark:text-amber-400";
    case "S":
      return "text-blue-600 dark:text-blue-400";
    case "A":
      return "text-green-600 dark:text-green-400";
    case "B":
      return "text-teal-600 dark:text-teal-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
}

/** 등급별 배경 색상 */
export function getGradeBgColor(grade: string): string {
  const gradeUpper = grade.toUpperCase();
  switch (gradeUpper) {
    case "VIP":
    case "VVIP":
      return "bg-purple-500";
    case "R":
    case "ROYAL":
      return "bg-amber-500";
    case "S":
      return "bg-blue-500";
    case "A":
      return "bg-green-500";
    case "B":
      return "bg-teal-500";
    default:
      return "bg-gray-500";
  }
}