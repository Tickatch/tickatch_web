/**
 * 공통 API 응답 타입 정의 (백엔드 common-lib과 동기화)
 */

// ========================================
// 필드 검증 오류
// ========================================

/** 필드 검증 오류 */
export interface FieldError {
  field: string;
  value: unknown;
  reason: string;
}

// ========================================
// 에러 상세 정보
// ========================================

/** 에러 상세 정보 */
export interface ErrorDetail {
  /** 에러 코드 */
  code: string;
  /** 에러 메시지 */
  message: string;
  /** HTTP 상태 코드 */
  status: number;
  /** 요청 경로 */
  path?: string;
  /** 필드별 검증 오류 목록 */
  fields?: FieldError[];
}

// ========================================
// API 응답 래퍼
// ========================================

/**
 * 통합 API 응답 포맷 (백엔드 ApiResponse와 동기화)
 *
 * 성공 응답 예시:
 * ```json
 * {
 *   "success": true,
 *   "data": { "ticketId": 123, "seatNumber": "A-15" },
 *   "timestamp": "2025-01-15T10:30:00Z"
 * }
 * ```
 *
 * 실패 응답 예시:
 * ```json
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "입력값이 유효하지 않습니다.",
 *     "status": 400,
 *     "path": "/api/tickets",
 *     "fields": [
 *       { "field": "email", "value": "invalid", "reason": "이메일 형식이 올바르지 않습니다." }
 *     ]
 *   },
 *   "timestamp": "2025-01-15T10:30:00Z"
 * }
 * ```
 */
export interface ApiResponse<T = unknown> {
  /** 요청 성공 여부 */
  success: boolean;
  /** 응답 메시지 (선택적) */
  message?: string;
  /** 응답 데이터 */
  data?: T;
  /** 에러 정보 (실패 시) */
  error?: ErrorDetail;
  /** 응답 생성 시간 (ISO 8601) */
  timestamp?: string;
  /** 분산 추적 ID */
  traceId?: string;
}

// ========================================
// 정렬 정보
// ========================================

/** 정렬 방향 */
export type SortDirection = "ASC" | "DESC";

/** 정렬 정보 */
export interface SortInfo {
  /** 정렬 속성 */
  property: string;
  /** 정렬 방향 */
  direction: SortDirection;
  /** 대소문자 무시 여부 */
  ignoreCase: boolean;
}

// ========================================
// 페이징 메타데이터
// ========================================

/**
 * 페이징 메타데이터 (백엔드 PageInfo와 동기화)
 */
export interface PageInfo {
  /** 현재 페이지 번호 (0부터 시작) */
  page: number;
  /** 페이지 크기 */
  size: number;
  /** 전체 요소 수 */
  totalElements: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 현재 페이지의 요소 수 */
  numberOfElements: number;
  /** 첫 번째 페이지 여부 */
  first: boolean;
  /** 마지막 페이지 여부 */
  last: boolean;
  /** 다음 페이지 존재 여부 */
  hasNext: boolean;
  /** 이전 페이지 존재 여부 */
  hasPrevious: boolean;
  /** 빈 페이지 여부 */
  empty: boolean;
  /** 정렬 정보 */
  sort?: SortInfo[];
}

// ========================================
// 페이징 응답
// ========================================

/**
 * 페이징 응답 (백엔드 PageResponse와 동기화)
 *
 * 사용 예시:
 * ```typescript
 * const response: ApiResponse<PageResponse<ProductResponse>> = await api.get('/products');
 * const products = response.data?.content || [];
 * const pageInfo = response.data?.pageInfo;
 * ```
 */
export interface PageResponse<T> {
  /** 페이지 컨텐츠 */
  content: T[];
  /** 페이지 메타 정보 */
  pageInfo: PageInfo;
}

// ========================================
// 유틸리티 타입
// ========================================

/** 성공 응답 타입 */
export type SuccessResponse<T> = ApiResponse<T> & { success: true; data: T };

/** 실패 응답 타입 */
export type ErrorResponse = ApiResponse<never> & { success: false; error: ErrorDetail };

// ========================================
// 유틸리티 함수
// ========================================

/**
 * API 응답이 성공인지 확인
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
  return response.success === true && response.data !== undefined;
}

/**
 * API 응답이 실패인지 확인
 */
export function isErrorResponse(response: ApiResponse<unknown>): response is ErrorResponse {
  return response.success === false && response.error !== undefined;
}

/**
 * API 에러 메시지 추출
 */
export function getErrorMessage(response: ApiResponse<unknown>): string {
  if (response.error?.message) {
    return response.error.message;
  }
  if (response.message) {
    return response.message;
  }
  return "알 수 없는 오류가 발생했습니다.";
}

/**
 * 필드 에러 메시지 맵 생성
 */
export function getFieldErrors(response: ApiResponse<unknown>): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (response.error?.fields) {
    response.error.fields.forEach((field) => {
      fieldErrors[field.field] = field.reason;
    });
  }

  return fieldErrors;
}

/**
 * 빈 페이지 응답 생성
 */
export function emptyPageResponse<T>(): PageResponse<T> {
  return {
    content: [],
    pageInfo: {
      page: 0,
      size: 0,
      totalElements: 0,
      totalPages: 0,
      numberOfElements: 0,
      first: true,
      last: true,
      hasNext: false,
      hasPrevious: false,
      empty: true,
    },
  };
}