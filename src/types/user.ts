// ========================================
// 공통 Enums
// ========================================

/**
 * 사용자 상태
 * @see UserStatus.java
 */
export type UserStatus = "ACTIVE" | "SUSPENDED" | "WITHDRAWN";

export const UserStatusLabel: Record<UserStatus, string> = {
  ACTIVE: "활성",
  SUSPENDED: "정지",
  WITHDRAWN: "탈퇴",
} as const;

/**
 * UserStatus 유틸리티 함수들
 */
export const UserStatusUtils = {
  isActive: (status: UserStatus) => status === "ACTIVE",
  isSuspended: (status: UserStatus) => status === "SUSPENDED",
  isWithdrawn: (status: UserStatus) => status === "WITHDRAWN",
  isTerminal: (status: UserStatus) => status === "WITHDRAWN",
  canSuspend: (status: UserStatus) => status === "ACTIVE",
  canActivate: (status: UserStatus) => status === "SUSPENDED",
  canWithdraw: (status: UserStatus) => status !== "WITHDRAWN",
} as const;

// ========================================
// 공통 Value Objects
// ========================================

/**
 * 주소 Value Object
 * @see Address.java
 */
export interface Address {
  zipCode: string | null;
  address1: string | null;
  address2: string | null;
}

/**
 * 사용자 프로필 Value Object
 * @see UserProfile.java
 */
export interface UserProfile {
  name: string;
  phone: string | null;
}

// ========================================
// Admin (관리자)
// ========================================

/**
 * 관리자 역할
 * @see AdminRole.java
 */
export type AdminRole = "MANAGER" | "ADMIN";

export const AdminRoleLabel: Record<AdminRole, string> = {
  MANAGER: "일반 관리자",
  ADMIN: "최고 관리자",
} as const;

export const AdminRoleLevel: Record<AdminRole, number> = {
  MANAGER: 1,
  ADMIN: 2,
} as const;

/**
 * AdminRole 유틸리티 함수들
 */
export const AdminRoleUtils = {
  isManager: (role: AdminRole) => role === "MANAGER",
  isAdmin: (role: AdminRole) => role === "ADMIN",
  isHigherThan: (role: AdminRole, other: AdminRole) =>
      AdminRoleLevel[role] > AdminRoleLevel[other],
  isHigherOrEqualThan: (role: AdminRole, other: AdminRole) =>
      AdminRoleLevel[role] >= AdminRoleLevel[other],
  canCreateAdmin: (role: AdminRole) => role === "ADMIN",
  canChangeRole: (role: AdminRole) => role === "ADMIN",
  canApproveSeller: (role: AdminRole) => AdminRoleLevel[role] >= AdminRoleLevel.MANAGER,
  canSuspendUser: (role: AdminRole) => AdminRoleLevel[role] >= AdminRoleLevel.MANAGER,
} as const;

/**
 * 관리자 응답 DTO
 * @see AdminResponse.java
 */
export interface AdminResponse {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  department: string | null;
  adminRole: AdminRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * 관리자 검색 요청 DTO (Query Params)
 * @see AdminSearchRequest.java
 */
export interface AdminSearchRequest {
  email?: string;
  name?: string;
  status?: UserStatus;
  adminRole?: AdminRole;
  department?: string;
}

/**
 * 관리자 생성 요청 DTO
 */
export interface CreateAdminRequest {
  email: string;
  name: string;
  phone?: string | null;
  department?: string | null;
  adminRole: AdminRole;
}

/**
 * 관리자 프로필 수정 요청 DTO
 */
export interface UpdateAdminProfileRequest {
  name: string;
  phone?: string | null;
  department?: string | null;
}

/**
 * 관리자 역할 변경 요청 DTO
 */
export interface ChangeAdminRoleRequest {
  newRole: AdminRole;
}

// ========================================
// Customer (고객)
// ========================================

/**
 * 고객 등급
 * @see CustomerGrade.java
 */
export type CustomerGrade = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "VIP";

export const CustomerGradeLabel: Record<CustomerGrade, string> = {
  BRONZE: "브론즈",
  SILVER: "실버",
  GOLD: "골드",
  PLATINUM: "플래티넘",
  VIP: "VIP",
} as const;

export const CustomerGradeLevel: Record<CustomerGrade, number> = {
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  PLATINUM: 4,
  VIP: 5,
} as const;

/**
 * CustomerGrade 유틸리티 함수들
 */
export const CustomerGradeUtils = {
  isHigherThan: (grade: CustomerGrade, other: CustomerGrade) =>
      CustomerGradeLevel[grade] > CustomerGradeLevel[other],
  isHigherOrEqualThan: (grade: CustomerGrade, other: CustomerGrade) =>
      CustomerGradeLevel[grade] >= CustomerGradeLevel[other],
  /** 등급 하향 불가 검증 */
  canChangeTo: (current: CustomerGrade, target: CustomerGrade) =>
      CustomerGradeLevel[target] >= CustomerGradeLevel[current],
} as const;

/**
 * 고객 응답 DTO
 * @see CustomerResponse.java
 */
export interface CustomerResponse {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  birthDate: string | null; // LocalDate → ISO string (YYYY-MM-DD)
  grade: CustomerGrade;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * 고객 검색 요청 DTO (Query Params)
 * @see CustomerSearchRequest.java
 */
export interface CustomerSearchRequest {
  email?: string;
  name?: string;
  phone?: string;
  status?: UserStatus;
  grade?: CustomerGrade;
}

/**
 * 고객 생성 요청 DTO
 */
export interface CreateCustomerRequest {
  email: string;
  name: string;
  phone?: string | null;
  birthDate?: string | null;
}

/**
 * 고객 프로필 수정 요청 DTO
 */
export interface UpdateCustomerProfileRequest {
  name: string;
  phone?: string | null;
  birthDate?: string | null;
}

/**
 * 고객 등급 변경 요청 DTO
 */
export interface ChangeCustomerGradeRequest {
  grade: CustomerGrade;
}

// ========================================
// Seller (판매자)
// ========================================

/**
 * 판매자 승인 상태
 * @see SellerStatus.java
 */
export type SellerStatus = "PENDING" | "APPROVED" | "REJECTED";

export const SellerStatusLabel: Record<SellerStatus, string> = {
  PENDING: "승인 대기",
  APPROVED: "승인 완료",
  REJECTED: "승인 거절",
} as const;

/**
 * SellerStatus 유틸리티 함수들
 */
export const SellerStatusUtils = {
  isPending: (status: SellerStatus) => status === "PENDING",
  isApproved: (status: SellerStatus) => status === "APPROVED",
  isRejected: (status: SellerStatus) => status === "REJECTED",
  canApprove: (status: SellerStatus) => status === "PENDING",
  canReject: (status: SellerStatus) => status === "PENDING",
  canRegisterPerformance: (status: SellerStatus) => status === "APPROVED",
  canUpdateSettlement: (status: SellerStatus) => status === "APPROVED",
  isTerminal: (status: SellerStatus) => status === "APPROVED" || status === "REJECTED",
} as const;

/**
 * 유효한 은행 코드 목록
 * @see SettlementInfo.java VALID_BANK_CODES
 */
export const BankCodes: Record<string, string> = {
  "004": "KB국민",
  "088": "신한",
  "020": "우리",
  "081": "하나",
  "003": "IBK기업",
  "011": "NH농협",
  "023": "SC제일",
  "027": "한국씨티",
  "039": "경남",
  "034": "광주",
  "031": "대구",
  "032": "부산",
  "037": "전북",
  "035": "제주",
  "007": "수협",
  "045": "새마을금고",
  "048": "신협",
  "064": "산림조합",
  "071": "우체국",
  "089": "K뱅크",
  "090": "카카오뱅크",
  "092": "토스뱅크",
} as const;

/** 유효한 은행 코드 배열 */
export const ValidBankCodes = Object.keys(BankCodes);

/**
 * 판매자 응답 DTO
 * @see SellerResponse.java
 *
 * 주의: 백엔드에서 flat 구조로 반환
 * - businessInfo가 개별 필드로 펼쳐짐
 * - settlementInfo는 hasSettlementInfo boolean으로만 노출
 */
export interface SellerResponse {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  /** 상호명 */
  businessName: string;
  /** 포맷팅된 사업자등록번호 (XXX-XX-XXXXX) */
  formattedBusinessNumber: string;
  /** 대표자명 */
  representativeName: string;
  /** 판매자 승인 상태 */
  sellerStatus: SellerStatus;
  /** 사용자 상태 */
  status: UserStatus;
  /** 정산 정보 등록 여부 */
  hasSettlementInfo: boolean;
  /** 승인 일시 */
  approvedAt: string | null;
  /** 승인자 */
  approvedBy: string | null;
  /** 거절 사유 */
  rejectedReason: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 판매자 검색 요청 DTO (Query Params)
 * @see SellerSearchRequest.java
 */
export interface SellerSearchRequest {
  email?: string;
  name?: string;
  status?: UserStatus;
  sellerStatus?: SellerStatus;
  businessName?: string;
  businessNumber?: string;
}

/**
 * 주소 요청 DTO
 */
export interface AddressRequest {
  zipCode?: string | null;
  address1?: string | null;
  address2?: string | null;
}

/**
 * 판매자 생성 요청 DTO
 */
export interface CreateSellerRequest {
  email: string;
  name: string;
  phone?: string | null;
  businessName: string;
  businessNumber: string;
  representativeName: string;
  businessAddress?: AddressRequest | null;
}

/**
 * 판매자 프로필 수정 요청 DTO
 */
export interface UpdateSellerProfileRequest {
  name: string;
  phone?: string | null;
}

/**
 * 사업자 정보 수정 요청 DTO
 */
export interface UpdateBusinessInfoRequest {
  businessName: string;
  businessNumber: string;
  representativeName: string;
  businessAddress?: AddressRequest | null;
}

/**
 * 정산 정보 수정 요청 DTO
 */
export interface UpdateSettlementInfoRequest {
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
}

/**
 * 판매자 거절 요청 DTO
 */
export interface RejectSellerRequest {
  reason: string;
}

// ========================================
// 상세 조회용 확장 타입 (필요시)
// ========================================

/**
 * 사업자 정보 (상세 조회 시)
 * @see BusinessInfo.java
 */
export interface BusinessInfo {
  businessName: string;
  businessNumber: string;
  representativeName: string;
  businessAddress: Address | null;
}

/**
 * 정산 정보 (상세 조회 시)
 * @see SettlementInfo.java
 */
export interface SettlementInfo {
  bankCode: string | null;
  accountNumber: string | null;
  accountHolder: string | null;
}

/**
 * 판매자 상세 응답 DTO (확장)
 * 상세 조회 API가 별도로 있을 경우 사용
 */
export interface SellerDetailResponse extends Omit<SellerResponse, "businessName" | "formattedBusinessNumber" | "representativeName" | "hasSettlementInfo"> {
  businessInfo: BusinessInfo;
  settlementInfo: SettlementInfo | null;
}

// ========================================
// 유틸리티 함수
// ========================================

/**
 * 사용자 상태 뱃지 색상
 */
export function getUserStatusColor(status: UserStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "SUSPENDED":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "WITHDRAWN":
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
}

/**
 * 판매자 승인 상태 뱃지 색상
 */
export function getSellerStatusColor(status: SellerStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "APPROVED":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "REJECTED":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
}

/**
 * 고객 등급 뱃지 색상
 */
export function getCustomerGradeColor(grade: CustomerGrade): string {
  switch (grade) {
    case "BRONZE":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
    case "SILVER":
      return "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300";
    case "GOLD":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "PLATINUM":
      return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300";
    case "VIP":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
}

/**
 * 관리자 역할 뱃지 색상
 */
export function getAdminRoleColor(role: AdminRole): string {
  switch (role) {
    case "MANAGER":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "ADMIN":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
}

/**
 * 전체 주소 문자열 생성
 * @see Address.java getFullAddress()
 */
export function getFullAddress(address: Address | null | undefined): string {
  if (!address) return "";

  const parts: string[] = [];
  if (address.zipCode) parts.push(`(${address.zipCode})`);
  if (address.address1) parts.push(address.address1);
  if (address.address2) parts.push(address.address2);

  return parts.join(" ").trim();
}

/**
 * 주소가 비어있는지 확인
 * @see Address.java isEmpty()
 */
export function isAddressEmpty(address: Address | null | undefined): boolean {
  if (!address) return true;
  return (
      (!address.zipCode || address.zipCode.trim() === "") &&
      (!address.address1 || address.address1.trim() === "") &&
      (!address.address2 || address.address2.trim() === "")
  );
}

/**
 * 은행 이름 조회
 */
export function getBankName(bankCode: string | null | undefined): string {
  if (!bankCode) return "";
  return BankCodes[bankCode] || bankCode;
}

/**
 * 마스킹된 계좌번호 생성
 * @see SettlementInfo.java getMaskedAccountNumber()
 */
export function getMaskedAccountNumber(accountNumber: string | null | undefined): string {
  if (!accountNumber || accountNumber.length < 4) return accountNumber || "";
  return accountNumber.substring(0, 4) + "*".repeat(accountNumber.length - 4);
}

/**
 * 정산 정보가 비어있는지 확인
 * @see SettlementInfo.java isEmpty()
 */
export function isSettlementInfoEmpty(info: SettlementInfo | null | undefined): boolean {
  if (!info) return true;
  return (
      (!info.bankCode || info.bankCode.trim() === "") &&
      (!info.accountNumber || info.accountNumber.trim() === "") &&
      (!info.accountHolder || info.accountHolder.trim() === "")
  );
}

/**
 * 정산 정보가 완전한지 확인
 * @see SettlementInfo.java isComplete()
 */
export function isSettlementInfoComplete(info: SettlementInfo | null | undefined): boolean {
  if (!info) return false;
  return (
      !!info.bankCode &&
      info.bankCode.trim() !== "" &&
      !!info.accountNumber &&
      info.accountNumber.trim() !== "" &&
      !!info.accountHolder &&
      info.accountHolder.trim() !== ""
  );
}

/**
 * 포맷팅된 사업자등록번호 생성
 * @see BusinessInfo.java getFormattedBusinessNumber()
 */
export function getFormattedBusinessNumber(businessNumber: string | null | undefined): string {
  if (!businessNumber) return "";
  // 이미 포맷팅된 경우 그대로 반환
  if (businessNumber.includes("-")) return businessNumber;
  // 10자리가 아니면 그대로 반환
  if (businessNumber.length !== 10) return businessNumber;
  return `${businessNumber.substring(0, 3)}-${businessNumber.substring(3, 5)}-${businessNumber.substring(5)}`;
}

/**
 * 포맷팅된 전화번호 생성
 */
export function getFormattedPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const cleaned = phone.replace(/-/g, "");
  if (cleaned.length === 11) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 7)}-${cleaned.substring(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
  return phone;
}

/**
 * 전화번호 정규화 (하이픈 제거)
 * @see UserProfile.java normalizePhone()
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone || phone.trim() === "") return null;
  return phone.replace(/-/g, "");
}

/**
 * 사업자등록번호 정규화 (하이픈 제거)
 * @see BusinessInfo.java normalizeBusinessNumber()
 */
export function normalizeBusinessNumber(businessNumber: string | null | undefined): string | null {
  if (!businessNumber || businessNumber.trim() === "") return null;
  return businessNumber.replace(/-/g, "");
}

/**
 * 은행 코드 유효성 검사
 */
export function isValidBankCode(bankCode: string | null | undefined): boolean {
  if (!bankCode) return false;
  return ValidBankCodes.includes(bankCode);
}

/**
 * 생년월일 포맷팅 (YYYY-MM-DD → YYYY년 MM월 DD일)
 */
export function getFormattedBirthDate(birthDate: string | null | undefined): string {
  if (!birthDate) return "";
  const [year, month, day] = birthDate.split("-");
  if (!year || !month || !day) return birthDate;
  return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
}

/**
 * 날짜/시간 포맷팅 (ISO string → 읽기 쉬운 형식)
 */
export function getFormattedDateTime(dateTime: string | null | undefined): string {
  if (!dateTime) return "";
  const date = new Date(dateTime);
  if (isNaN(date.getTime())) return dateTime;
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 날짜 포맷팅 (ISO string → 읽기 쉬운 형식)
 */
export function getFormattedDate(dateTime: string | null | undefined): string {
  if (!dateTime) return "";
  const date = new Date(dateTime);
  if (isNaN(date.getTime())) return dateTime;
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ========================================
// 타입 가드
// ========================================

export function isAdminResponse(user: unknown): user is AdminResponse {
  return (
      typeof user === "object" &&
      user !== null &&
      "adminRole" in user &&
      "department" in user
  );
}

export function isCustomerResponse(user: unknown): user is CustomerResponse {
  return (
      typeof user === "object" &&
      user !== null &&
      "grade" in user &&
      "birthDate" in user &&
      !("adminRole" in user) &&
      !("sellerStatus" in user)
  );
}

export function isSellerResponse(user: unknown): user is SellerResponse {
  return (
      typeof user === "object" &&
      user !== null &&
      "sellerStatus" in user &&
      "businessName" in user
  );
}

// ========================================
// 페이징 요청 파라미터
// ========================================

/**
 * 페이징 요청 파라미터
 */
export interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Admin 목록 조회 파라미터
 */
export type AdminListParams = AdminSearchRequest & PageRequest;

/**
 * Customer 목록 조회 파라미터
 */
export type CustomerListParams = CustomerSearchRequest & PageRequest;

/**
 * Seller 목록 조회 파라미터
 */
export type SellerListParams = SellerSearchRequest & PageRequest;