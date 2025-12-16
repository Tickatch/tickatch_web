/**
 * 공연장(Venue) 관련 타입 정의
 * ArtHall, Stage, StageSeat (백엔드 ArtHall Service와 동기화)
 */

// ========== Enums ==========

/** 공연장 상태 */
export type ArtHallStatus = "ACTIVE" | "INACTIVE";

/** 스테이지 상태 */
export type StageStatus = "ACTIVE" | "INACTIVE";

/** 좌석 상태 */
export type StageSeatStatus = "ACTIVE" | "INACTIVE";

// ========== Labels ==========

export const ART_HALL_STATUS_LABELS: Record<ArtHallStatus, string> = {
  ACTIVE: "운영중",
  INACTIVE: "운영중지",
};

export const STAGE_STATUS_LABELS: Record<StageStatus, string> = {
  ACTIVE: "운영중",
  INACTIVE: "운영중지",
};

export const STAGE_SEAT_STATUS_LABELS: Record<StageSeatStatus, string> = {
  ACTIVE: "이용가능",
  INACTIVE: "이용불가",
};

// ========== ArtHall Response ==========

/** 공연장 목록 응답 */
export interface ArtHallListResponse {
  id: number;
  name: string;
  address: string;
  status: ArtHallStatus;
  createdAt: string;
}

/** 공연장 상세 응답 */
export interface ArtHallDetailResponse {
  id: number;
  name: string;
  address: string;
  status: ArtHallStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt: string | null;
}

/** 공연장 등록/수정/상태변경 응답 */
export interface ArtHallResponse {
  id: number;
  name: string;
  address: string;
  status: ArtHallStatus;
}

// ========== ArtHall Request ==========

/** 공연장 등록 요청 */
export interface ArtHallRegisterRequest {
  name: string;
  address: string;
  status: ArtHallStatus;
}

/** 공연장 수정 요청 */
export interface ArtHallUpdateRequest {
  name: string;
  address: string;
  status: ArtHallStatus;
}

/** 공연장 상태 변경 요청 */
export interface ArtHallStatusUpdateRequest {
  status: ArtHallStatus;
}

// ========== Stage Response ==========

/** 스테이지 목록 응답 */
export interface StageListResponse {
  stageId: number;
  artHallId: number;
  name: string;
  status: StageStatus;
  createdAt: string;
}

/** 스테이지 상세 응답 */
export interface StageDetailResponse {
  stageId: number;
  artHallId: number;
  name: string;
  status: StageStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

/** 스테이지 등록 응답 */
export interface StageRegisterResponse {
  stageId: number;
  artHallId: number;
  name: string;
  status: StageStatus;
}

/** 스테이지 수정/상태변경 응답 */
export interface StageResponse {
  stageId: number;
  name: string;
  status: StageStatus;
}

// ========== Stage Request ==========

/** 스테이지 등록 요청 */
export interface StageRegisterRequest {
  name: string;
  status: StageStatus;
}

/** 스테이지 수정 요청 */
export interface StageUpdateRequest {
  name: string;
  status: StageStatus;
}

/** 스테이지 상태 변경 요청 */
export interface StageStatusUpdateRequest {
  status: StageStatus;
}

// ========== StageSeat Response ==========

/** 좌석 목록 아이템 */
export interface StageSeatListItem {
  id: number;
  seatNumber: string;
  status: StageSeatStatus;
  row: number;
  col: number;
  vector: number[]; // [vectorX, vectorY]
}

/** 좌석 목록 응답 */
export interface StageSeatListResponse {
  content: StageSeatListItem[];
}

/** 좌석 상세 응답 */
export interface StageSeatDetailResponse {
  content: {
    id: number;
    stageId: number;
    seatNumber: string;
    status: StageSeatStatus;
    row: number;
    col: number;
    vector: number[];
    createdAt: string;
    updatedAt: string;
  };
}

/** 좌석 등록 응답 */
export interface StageSeatRegisterResponse {
  id: number;
  seatNumber: string;
  status: StageSeatStatus;
  row: number;
  col: number;
  vector: number[];
}

/** 좌석 수정 응답 */
export interface StageSeatUpdateResponse {
  id: number;
  seatNumber: string;
  status: StageSeatStatus;
  row: number;
  col: number;
  vector: number[];
}

/** 좌석 상태 변경 응답 */
export interface StageSeatStatusUpdateResponse {
  id: number;
  seatNumber: string;
  status: StageSeatStatus;
}

// ========== StageSeat Request ==========

/** 좌석 등록 요청 (단일) */
export interface StageSeatRegisterRequest {
  seatNumber: string;
  status: StageSeatStatus;
  row: number;
  col: number;
  vectorX: number;
  vectorY: number;
}

/** 좌석 위치 수정 요청 */
export interface StageSeatUpdateRequest {
  row: number;
  col: number;
  vectorX: number;
  vectorY: number;
}

/** 좌석 상태 변경 요청 (벌크) */
export interface StageSeatStatusUpdateRequest {
  seatIds: number[];
  status: StageSeatStatus;
}

/** 좌석 삭제 요청 (벌크) */
export interface StageSeatDeleteRequest {
  seatIds: number[];
}

// ========== 유틸리티 ==========

/** 공연장 상태별 색상 */
export function getArtHallStatusColor(status: ArtHallStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "INACTIVE":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/** 스테이지 상태별 색상 */
export function getStageStatusColor(status: StageStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "INACTIVE":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/** 좌석 상태별 색상 */
export function getStageSeatStatusColor(status: StageSeatStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "INACTIVE":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    default:
      return "bg-gray-100 text-gray-800";
  }
}