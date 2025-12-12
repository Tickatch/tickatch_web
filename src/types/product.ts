/**
 * 상품 타입 (백엔드 ProductType enum과 동기화)
 */
export type ProductType = "CONCERT" | "MUSICAL" | "PLAY" | "SPORTS";

/**
 * 상품 상태 (백엔드 ProductStatus enum과 동기화)
 */
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

/**
 * 관람 등급 (백엔드 AgeRating enum과 동기화)
 */
export type AgeRating = "ALL" | "TWELVE" | "FIFTEEN" | "NINETEEN";

/**
 * 카테고리 정보
 */
export interface Category {
  type: ProductType | "QUEUE";
  label: string;
  href: string;
}

/**
 * 네비게이션 카테고리 목록
 */
export const CATEGORIES: Category[] = [
  { type: "CONCERT", label: "콘서트", href: "/category/concert" },
  { type: "MUSICAL", label: "뮤지컬", href: "/category/musical" },
  { type: "PLAY", label: "연극", href: "/category/play" },
  { type: "SPORTS", label: "스포츠", href: "/category/sports" },
  { type: "QUEUE", label: "대기열", href: "/queue" },
];

/**
 * 상품 타입 라벨 매핑
 */
export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  CONCERT: "콘서트",
  MUSICAL: "뮤지컬",
  PLAY: "연극",
  SPORTS: "스포츠",
};

/**
 * 상품 상태 라벨 매핑
 */
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

/**
 * 관람 등급 라벨 매핑
 */
export const AGE_RATING_LABELS: Record<AgeRating, string> = {
  ALL: "전체 관람가",
  TWELVE: "12세 이상",
  FIFTEEN: "15세 이상",
  NINETEEN: "19세 이상",
};

/**
 * 좌석 등급 정보
 */
export interface SeatGrade {
  gradeName: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
}

/**
 * 상품 응답 DTO (백엔드 ProductResponse와 동기화)
 */
export interface ProductResponse {
  id: number;
  name: string;
  productType: ProductType;
  status: ProductStatus;

  // 일정
  startAt: string;
  endAt: string;
  saleStartAt: string;
  saleEndAt: string;
  runningTime: number;

  // 장소
  stageId: number;
  stageName: string;
  artHallId: number;
  artHallName: string;
  artHallAddress: string;

  // 콘텐츠
  description?: string;
  posterImageUrl?: string;
  detailImageUrls?: string;
  castInfo?: string;
  notice?: string;
  organizer?: string;
  agency?: string;

  // 관람 제한
  ageRating: AgeRating;
  restrictionNotice?: string;

  // 예매 정책
  maxTicketsPerPerson: number;
  idVerificationRequired: boolean;
  transferable: boolean;

  // 입장 정책
  admissionMinutesBefore: number;
  lateEntryAllowed: boolean;
  lateEntryNotice?: string;
  hasIntermission: boolean;
  intermissionMinutes: number;
  photographyAllowed: boolean;
  foodAllowed: boolean;

  // 환불 정책
  cancellable: boolean;
  cancelDeadlineDays: number;
  refundPolicyText?: string;

  // 좌석 정보
  seatGrades?: SeatGrade[];
  totalSeats: number;
  availableSeats: number;

  // 메타
  viewCount: number;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 상품 검색 요청
 */
export interface ProductSearchRequest {
  name?: string;
  productType?: ProductType;
  status?: ProductStatus;
  stageId?: number;
  sellerId?: string;
}

/**
 * 페이지 응답
 */
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

/**
 * API 응답 래퍼
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * 배너 아이템 (상품 기반)
 */
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

/**
 * ProductResponse를 BannerItem으로 변환
 */
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