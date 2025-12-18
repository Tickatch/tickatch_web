/**
 * 상품 관련 타입 정의 (백엔드 Product Service와 동기화)
 */

// ========== Enums ==========

/** 상품 타입 */
export type ProductType = "CONCERT" | "MUSICAL" | "PLAY" | "SPORTS";

/** 상품 상태 */
export type ProductStatus =
    | "DRAFT"      // 임시저장
    | "PENDING"    // 심사대기
    | "APPROVED"   // 승인됨
    | "REJECTED"   // 반려됨
    | "SCHEDULED"  // 예매예정
    | "ON_SALE"    // 판매중
    | "CLOSED"     // 판매종료
    | "COMPLETED"  // 행사종료
    | "CANCELLED"; // 취소됨

/** 관람 등급 */
export type AgeRating = "ALL" | "TWELVE" | "FIFTEEN" | "NINETEEN";

// ========== 라벨 매핑 ==========

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  CONCERT: "콘서트",
  MUSICAL: "뮤지컬",
  PLAY: "연극",
  SPORTS: "스포츠",
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  DRAFT: "임시저장",
  PENDING: "심사대기",
  APPROVED: "승인됨",
  REJECTED: "반려됨",
  SCHEDULED: "예매예정",
  ON_SALE: "판매중",
  CLOSED: "판매종료",
  COMPLETED: "행사종료",
  CANCELLED: "취소됨",
};

export const AGE_RATING_LABELS: Record<AgeRating, string> = {
  ALL: "전체 관람가",
  TWELVE: "12세 이상",
  FIFTEEN: "15세 이상",
  NINETEEN: "19세 이상",
};

// ========== 카테고리 ==========

export interface Category {
  type: ProductType | "ALL" | "QUEUE";
  label: string;
  href: string;
}

export const CATEGORIES: Category[] = [
  { type: "ALL", label: "전체", href: "/products" },
  { type: "CONCERT", label: "콘서트", href: "/products?type=CONCERT" },
  { type: "MUSICAL", label: "뮤지컬", href: "/products?type=MUSICAL" },
  { type: "PLAY", label: "연극", href: "/products?type=PLAY" },
  { type: "SPORTS", label: "스포츠", href: "/products?type=SPORTS" },
  { type: "QUEUE", label: "대기열", href: "/queue" },
];

// ========== 좌석 관련 ==========

/** 좌석 등급 응답 (백엔드 SeatGradeResponse와 동기화) */
export interface SeatGradeResponse {
  id: number;
  gradeName: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  displayOrder: number;
  soldOut: boolean;
}

/** 좌석 등급 정보 (하위 호환용) */
export interface SeatGrade {
  gradeName: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
}

/** 좌석 등급 생성 요청 */
export interface SeatGradeRequest {
  gradeName: string;
  price: number;
  totalSeats: number;
}

/** 개별 좌석 생성 요청 */
export interface SeatCreateRequest {
  seatNumber: string;
  grade: string;
  price: number;
}

// ========== Response DTOs ==========

/** 상품 응답 (백엔드 ProductResponse와 완전 동기화) */
export interface ProductResponse {
  // ========== 기본 정보 ==========
  id: number;
  sellerId: string;
  name: string;
  productType: ProductType;
  runningTime: number;

  // ========== 일정 ==========
  startAt: string;
  endAt: string;
  saleStartAt: string;
  saleEndAt: string;

  // ========== 장소 ==========
  stageId: number;
  stageName: string;
  artHallId: number;
  artHallName: string;
  artHallAddress: string;

  // ========== 콘텐츠 ==========
  description?: string | null;
  posterImageUrl?: string | null;
  detailImageUrls?: string | null;  // JSON 문자열
  castInfo?: string | null;
  notice?: string | null;
  organizer?: string | null;
  agency?: string | null;

  // ========== 관람 제한 ==========
  ageRating: AgeRating;
  restrictionNotice?: string | null;

  // ========== 예매 정책 ==========
  maxTicketsPerPerson: number;
  idVerificationRequired: boolean;
  transferable: boolean;

  // ========== 입장 정책 ==========
  admissionMinutesBefore: number;
  lateEntryAllowed: boolean;
  lateEntryNotice?: string | null;
  hasIntermission: boolean;
  intermissionMinutes: number;
  photographyAllowed: boolean;
  foodAllowed: boolean;

  // ========== 환불 정책 ==========
  cancellable: boolean;
  cancelDeadlineDays: number;
  refundPolicyText?: string | null;

  // ========== 좌석 현황 ==========
  totalSeats: number;
  availableSeats: number;
  soldOut: boolean;
  seatGrades: SeatGradeResponse[];

  // ========== 통계 ==========
  viewCount: number;
  reservationCount: number;

  // ========== 상태 ==========
  purchasable: boolean;
  status: ProductStatus;
  rejectionReason?: string | null;

  // ========== 감사 정보 ==========
  createdAt: string;
  updatedAt: string;
}

// ========== Request DTOs ==========

/** 상품 검색 요청 */
export interface ProductSearchRequest {
  name?: string;
  productType?: ProductType;
  status?: ProductStatus;
  stageId?: number;
  sellerId?: string;
}

/** 상품 생성 요청 */
export interface ProductCreateRequest {
  // 기본 정보 (필수)
  name: string;
  productType: ProductType;
  runningTime: number;

  // 일정 (필수)
  startAt: string;
  endAt: string;
  saleStartAt: string;
  saleEndAt: string;

  // 장소 (필수)
  stageId: number;
  stageName: string;
  artHallId: number;
  artHallName: string;
  artHallAddress: string;

  // 콘텐츠 (선택)
  description?: string;
  posterImageUrl?: string;
  detailImageUrls?: string;
  castInfo?: string;
  notice?: string;
  organizer?: string;
  agency?: string;

  // 관람 제한 (필수: ageRating)
  ageRating: AgeRating;
  restrictionNotice?: string;

  // 예매 정책 (필수: maxTicketsPerPerson)
  maxTicketsPerPerson: number;
  idVerificationRequired?: boolean;
  transferable?: boolean;

  // 입장 정책 (필수: admissionMinutesBefore)
  admissionMinutesBefore: number;
  lateEntryAllowed?: boolean;
  lateEntryNotice?: string;
  hasIntermission?: boolean;
  intermissionMinutes?: number;
  photographyAllowed?: boolean;
  foodAllowed?: boolean;

  // 환불 정책 (필수: cancellable)
  cancellable: boolean;
  cancelDeadlineDays?: number;
  refundPolicyText?: string;

  // 좌석 정보 (필수)
  seatGradeInfos: SeatGradeRequest[];
  seatCreateInfos: SeatCreateRequest[];
}

/** 상품 수정 요청 (모든 필드 선택적) */
export interface ProductUpdateRequest {
  // 기본 정보
  name?: string;
  productType?: ProductType;
  runningTime?: number;

  // 일정 (세트 - 4개 모두 필요)
  startAt?: string;
  endAt?: string;
  saleStartAt?: string;
  saleEndAt?: string;

  // 장소 (세트 - 5개 모두 필요)
  stageId?: number;
  stageName?: string;
  artHallId?: number;
  artHallName?: string;
  artHallAddress?: string;

  // 콘텐츠
  description?: string;
  posterImageUrl?: string;
  detailImageUrls?: string;
  castInfo?: string;
  notice?: string;
  organizer?: string;
  agency?: string;

  // 관람 제한
  ageRating?: AgeRating;
  restrictionNotice?: string;

  // 예매 정책
  maxTicketsPerPerson?: number;
  idVerificationRequired?: boolean;
  transferable?: boolean;

  // 입장 정책
  admissionMinutesBefore?: number;
  lateEntryAllowed?: boolean;
  lateEntryNotice?: string;
  hasIntermission?: boolean;
  intermissionMinutes?: number;
  photographyAllowed?: boolean;
  foodAllowed?: boolean;

  // 환불 정책
  cancellable?: boolean;
  cancelDeadlineDays?: number;
  refundPolicyText?: string;

  // 좌석 (세트 - 전체 교체)
  seatGradeInfos?: SeatGradeRequest[];
  seatCreateInfos?: SeatCreateRequest[];
}

/** 장소 변경 요청 */
export interface VenueChangeRequest {
  stageId: number;
  stageName: string;
  artHallId: number;
  artHallName: string;
  artHallAddress: string;
}

/** 상품 반려 요청 */
export interface RejectRequest {
  reason: string;
}

/** 상품 상태 변경 요청 */
export interface StatusChangeRequest {
  status: ProductStatus;
}

// ========== 페이지 응답 ==========

/** 페이지 응답 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ========== 배너 ==========

/** 배너 아이템 */
export interface BannerItem {
  id: number;
  title: string;
  subtitle?: string;
  mainImage: string;
  posterImage: string;
  link: string;
  period?: string;
  productType: ProductType;
}

/** ProductResponse를 BannerItem으로 변환 */
export function productToBannerItem(product: ProductResponse): BannerItem {
  const startDate = new Date(product.startAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const endDate = new Date(product.endAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return {
    id: product.id,
    title: product.name,
    subtitle: product.artHallName,
    mainImage: product.posterImageUrl || "",
    posterImage: product.posterImageUrl || "",
    link: `/products/${product.id}`,
    period: `${startDate} ~ ${endDate}`,
    productType: product.productType,
  };
}

// ========== 유틸리티 ==========

/** 상품 타입 URL 파라미터 변환 */
export function getProductTypeFromParam(param: string): ProductType | undefined {
  const upper = param.toUpperCase();
  if (["CONCERT", "MUSICAL", "PLAY", "SPORTS"].includes(upper)) {
    return upper as ProductType;
  }
  return undefined;
}

/** 상품 상태별 색상 */
export function getStatusColor(status: ProductStatus): string {
  switch (status) {
    case "DRAFT":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "APPROVED":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "REJECTED":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "SCHEDULED":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "ON_SALE":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "CLOSED":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    case "COMPLETED":
      return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400";
    case "CANCELLED":
      return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/** 상품 타입별 색상 */
export function getProductTypeColor(type: ProductType): string {
  switch (type) {
    case "CONCERT":
      return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400";
    case "MUSICAL":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "PLAY":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    case "SPORTS":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/** detailImageUrls JSON 문자열을 배열로 파싱 */
export function parseDetailImageUrls(detailImageUrls?: string | null): string[] {
  if (!detailImageUrls) return [];
  try {
    const parsed = JSON.parse(detailImageUrls);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // JSON 파싱 실패 시 콤마로 구분된 문자열로 처리
    return detailImageUrls.split(",").map(s => s.trim()).filter(Boolean);
  }
}

/** 최소 가격 구하기 */
export function getMinPrice(seatGrades?: SeatGradeResponse[]): number {
  if (!seatGrades?.length) return 0;
  return Math.min(...seatGrades.map((g) => g.price));
}

/** 최대 가격 구하기 */
export function getMaxPrice(seatGrades?: SeatGradeResponse[]): number {
  if (!seatGrades?.length) return 0;
  return Math.max(...seatGrades.map((g) => g.price));
}