"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ProductType,
  AgeRating,
  PRODUCT_TYPE_LABELS,
  AGE_RATING_LABELS,
  SeatGradeRequest,
} from "@/types/product";
import { ArtHallListResponse, StageListResponse } from "@/types/venue";

// 더미 공연장 목록
const DUMMY_ART_HALLS: ArtHallListResponse[] = [
  { id: 1, name: "올림픽공원 KSPO DOME", address: "서울특별시 송파구 올림픽로 424", status: "ACTIVE", createdAt: "2025-01-01" },
  { id: 2, name: "블루스퀘어", address: "서울특별시 용산구 이태원로 294", status: "ACTIVE", createdAt: "2025-01-01" },
  { id: 3, name: "고척스카이돔", address: "서울특별시 구로구 경인로 430", status: "ACTIVE", createdAt: "2025-01-01" },
  { id: 4, name: "예술의전당", address: "서울특별시 서초구 남부순환로 2406", status: "ACTIVE", createdAt: "2025-01-01" },
];

// 더미 스테이지 목록
const DUMMY_STAGES: Record<number, StageListResponse[]> = {
  1: [
    { stageId: 1, artHallId: 1, name: "메인홀", status: "ACTIVE", createdAt: "2025-01-01" },
    { stageId: 2, artHallId: 1, name: "소홀", status: "ACTIVE", createdAt: "2025-01-01" },
  ],
  2: [
    { stageId: 3, artHallId: 2, name: "대극장", status: "ACTIVE", createdAt: "2025-01-01" },
    { stageId: 4, artHallId: 2, name: "신한카드홀", status: "ACTIVE", createdAt: "2025-01-01" },
  ],
  3: [
    { stageId: 5, artHallId: 3, name: "메인 구장", status: "ACTIVE", createdAt: "2025-01-01" },
  ],
  4: [
    { stageId: 6, artHallId: 4, name: "오페라극장", status: "ACTIVE", createdAt: "2025-01-01" },
    { stageId: 7, artHallId: 4, name: "토월극장", status: "ACTIVE", createdAt: "2025-01-01" },
    { stageId: 8, artHallId: 4, name: "자유소극장", status: "ACTIVE", createdAt: "2025-01-01" },
  ],
};

interface FormData {
  // 기본 정보
  name: string;
  productType: ProductType;
  runningTime: number;
  description: string;
  posterImageUrl: string;
  castInfo: string;
  notice: string;
  organizer: string;
  agency: string;

  // 일정
  startAt: string;
  endAt: string;
  saleStartAt: string;
  saleEndAt: string;

  // 장소
  artHallId: number;
  stageId: number;

  // 관람 제한
  ageRating: AgeRating;
  restrictionNotice: string;

  // 예매 정책
  maxTicketsPerPerson: number;
  idVerificationRequired: boolean;
  transferable: boolean;

  // 입장 정책
  admissionMinutesBefore: number;
  lateEntryAllowed: boolean;
  lateEntryNotice: string;
  hasIntermission: boolean;
  intermissionMinutes: number;
  photographyAllowed: boolean;
  foodAllowed: boolean;

  // 환불 정책
  cancellable: boolean;
  cancelDeadlineDays: number;
  refundPolicyText: string;

  // 좌석 등급
  seatGrades: SeatGradeRequest[];
}

const initialFormData: FormData = {
  name: "",
  productType: "CONCERT",
  runningTime: 120,
  description: "",
  posterImageUrl: "",
  castInfo: "",
  notice: "",
  organizer: "",
  agency: "",
  startAt: "",
  endAt: "",
  saleStartAt: "",
  saleEndAt: "",
  artHallId: 0,
  stageId: 0,
  ageRating: "ALL",
  restrictionNotice: "",
  maxTicketsPerPerson: 4,
  idVerificationRequired: false,
  transferable: true,
  admissionMinutesBefore: 30,
  lateEntryAllowed: false,
  lateEntryNotice: "",
  hasIntermission: false,
  intermissionMinutes: 15,
  photographyAllowed: false,
  foodAllowed: false,
  cancellable: true,
  cancelDeadlineDays: 7,
  refundPolicyText: "",
  seatGrades: [{ gradeName: "R석", price: 100000, totalSeats: 100 }],
};

export default function NewProductPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [artHalls, setArtHalls] = useState<ArtHallListResponse[]>([]);
  const [stages, setStages] = useState<StageListResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 5;

  // 공연장 목록 로드
  useEffect(() => {
    // TODO: 실제 API 호출
    setArtHalls(DUMMY_ART_HALLS);
  }, []);

  // 스테이지 목록 로드
  useEffect(() => {
    if (formData.artHallId) {
      // TODO: 실제 API 호출
      setStages(DUMMY_STAGES[formData.artHallId] || []);
      setFormData((prev) => ({ ...prev, stageId: 0 }));
    } else {
      setStages([]);
    }
  }, [formData.artHallId]);

  const updateFormData = (field: keyof FormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSeatGrade = () => {
    setFormData((prev) => ({
      ...prev,
      seatGrades: [
        ...prev.seatGrades,
        { gradeName: "", price: 0, totalSeats: 0 },
      ],
    }));
  };

  const updateSeatGrade = (index: number, field: keyof SeatGradeRequest, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      seatGrades: prev.seatGrades.map((grade, i) =>
          i === index ? { ...grade, [field]: value } : grade
      ),
    }));
  };

  const removeSeatGrade = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      seatGrades: prev.seatGrades.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    setIsSubmitting(true);
    try {
      // TODO: 실제 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert(isDraft ? "임시저장 되었습니다." : "상품이 등록되었습니다. 관리자 승인 후 판매가 시작됩니다.");
      router.push("/seller/products");
    } catch (error) {
      alert("상품 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedArtHall = artHalls.find((ah) => ah.id === formData.artHallId);
  const selectedStage = stages.find((s) => s.stageId === formData.stageId);

  return (
      <div className="max-w-4xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            새 상품 등록
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            공연/이벤트 정보를 입력해주세요.
          </p>
        </div>

        {/* 스텝 인디케이터 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {["기본 정보", "일정 & 장소", "정책 설정", "좌석 등급", "확인"].map(
                (label, index) => {
                  const step = index + 1;
                  const isActive = step === currentStep;
                  const isCompleted = step < currentStep;
                  return (
                      <div key={step} className="flex items-center">
                        <div
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                                isActive
                                    ? "bg-orange-500 text-white"
                                    : isCompleted
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                            )}
                        >
                          {isCompleted ? "✓" : step}
                        </div>
                        <span
                            className={cn(
                                "ml-2 text-sm hidden sm:inline",
                                isActive
                                    ? "text-orange-500 font-medium"
                                    : "text-gray-500"
                            )}
                        >
                    {label}
                  </span>
                        {step < totalSteps && (
                            <div
                                className={cn(
                                    "w-8 sm:w-16 h-0.5 mx-2",
                                    isCompleted ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                                )}
                            />
                        )}
                      </div>
                  );
                }
            )}
          </div>
        </div>

        {/* 폼 컨텐츠 */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          {/* Step 1: 기본 정보 */}
          {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  기본 정보
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    상품명 *
                  </label>
                  <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      placeholder="예: 2025 아이유 콘서트"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      상품 유형 *
                    </label>
                    <select
                        value={formData.productType}
                        onChange={(e) => updateFormData("productType", e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      러닝타임 (분) *
                    </label>
                    <input
                        type="number"
                        value={formData.runningTime}
                        onChange={(e) => updateFormData("runningTime", Number(e.target.value))}
                        min={1}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    포스터 이미지 URL
                  </label>
                  <input
                      type="url"
                      value={formData.posterImageUrl}
                      onChange={(e) => updateFormData("posterImageUrl", e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    상품 설명
                  </label>
                  <textarea
                      value={formData.description}
                      onChange={(e) => updateFormData("description", e.target.value)}
                      rows={4}
                      placeholder="공연에 대한 상세 설명을 입력하세요."
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      출연진 정보
                    </label>
                    <textarea
                        value={formData.castInfo}
                        onChange={(e) => updateFormData("castInfo", e.target.value)}
                        rows={2}
                        placeholder="출연진 정보"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      주최/기획사
                    </label>
                    <input
                        type="text"
                        value={formData.organizer}
                        onChange={(e) => updateFormData("organizer", e.target.value)}
                        placeholder="주최사 이름"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 mb-2"
                    />
                    <input
                        type="text"
                        value={formData.agency}
                        onChange={(e) => updateFormData("agency", e.target.value)}
                        placeholder="기획사 이름"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
          )}

          {/* Step 2: 일정 & 장소 */}
          {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  일정 & 장소
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      공연 시작일 *
                    </label>
                    <input
                        type="datetime-local"
                        value={formData.startAt}
                        onChange={(e) => updateFormData("startAt", e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      공연 종료일 *
                    </label>
                    <input
                        type="datetime-local"
                        value={formData.endAt}
                        onChange={(e) => updateFormData("endAt", e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      판매 시작일 *
                    </label>
                    <input
                        type="datetime-local"
                        value={formData.saleStartAt}
                        onChange={(e) => updateFormData("saleStartAt", e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      판매 종료일 *
                    </label>
                    <input
                        type="datetime-local"
                        value={formData.saleEndAt}
                        onChange={(e) => updateFormData("saleEndAt", e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      공연장 *
                    </label>
                    <select
                        value={formData.artHallId}
                        onChange={(e) => updateFormData("artHallId", Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value={0}>공연장 선택</option>
                      {artHalls.map((ah) => (
                          <option key={ah.id} value={ah.id}>
                            {ah.name}
                          </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      스테이지 *
                    </label>
                    <select
                        value={formData.stageId}
                        onChange={(e) => updateFormData("stageId", Number(e.target.value))}
                        disabled={!formData.artHallId}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                    >
                      <option value={0}>스테이지 선택</option>
                      {stages.map((s) => (
                          <option key={s.stageId} value={s.stageId}>
                            {s.name}
                          </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedArtHall && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">주소:</span> {selectedArtHall.address}
                      </p>
                    </div>
                )}
              </div>
          )}

          {/* Step 3: 정책 설정 */}
          {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  정책 설정
                </h2>

                {/* 관람 제한 */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">관람 제한</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        관람 등급 *
                      </label>
                      <select
                          value={formData.ageRating}
                          onChange={(e) => updateFormData("ageRating", e.target.value)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        {Object.entries(AGE_RATING_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        1인 최대 구매 수량 *
                      </label>
                      <input
                          type="number"
                          value={formData.maxTicketsPerPerson}
                          onChange={(e) => updateFormData("maxTicketsPerPerson", Number(e.target.value))}
                          min={1}
                          max={10}
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 입장 정책 */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">입장 정책</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        입장 시작 (공연 전 분)
                      </label>
                      <input
                          type="number"
                          value={formData.admissionMinutesBefore}
                          onChange={(e) => updateFormData("admissionMinutesBefore", Number(e.target.value))}
                          min={0}
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="flex items-center gap-4 pt-8">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.lateEntryAllowed}
                            onChange={(e) => updateFormData("lateEntryAllowed", e.target.checked)}
                            className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">지각 입장 허용</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.hasIntermission}
                            onChange={(e) => updateFormData("hasIntermission", e.target.checked)}
                            className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">인터미션 있음</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                          type="checkbox"
                          checked={formData.photographyAllowed}
                          onChange={(e) => updateFormData("photographyAllowed", e.target.checked)}
                          className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">촬영 허용</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                          type="checkbox"
                          checked={formData.foodAllowed}
                          onChange={(e) => updateFormData("foodAllowed", e.target.checked)}
                          className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">음식 반입 허용</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                          type="checkbox"
                          checked={formData.idVerificationRequired}
                          onChange={(e) => updateFormData("idVerificationRequired", e.target.checked)}
                          className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">본인 확인 필수</span>
                    </label>
                  </div>
                </div>

                {/* 환불 정책 */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">환불 정책</h3>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                          type="checkbox"
                          checked={formData.cancellable}
                          onChange={(e) => updateFormData("cancellable", e.target.checked)}
                          className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">취소 가능</span>
                    </label>
                    {formData.cancellable && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700 dark:text-gray-300">공연</span>
                          <input
                              type="number"
                              value={formData.cancelDeadlineDays}
                              onChange={(e) => updateFormData("cancelDeadlineDays", Number(e.target.value))}
                              min={0}
                              className="w-16 px-2 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-center"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">일 전까지</span>
                        </div>
                    )}
                  </div>
                </div>
              </div>
          )}

          {/* Step 4: 좌석 등급 */}
          {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    좌석 등급
                  </h2>
                  <button
                      type="button"
                      onClick={addSeatGrade}
                      className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    등급 추가
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.seatGrades.map((grade, index) => (
                      <div
                          key={index}
                          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      등급 {index + 1}
                    </span>
                          {formData.seatGrades.length > 1 && (
                              <button
                                  type="button"
                                  onClick={() => removeSeatGrade(index)}
                                  className="text-red-500 hover:text-red-600 text-sm"
                              >
                                삭제
                              </button>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">등급명</label>
                            <input
                                type="text"
                                value={grade.gradeName}
                                onChange={(e) => updateSeatGrade(index, "gradeName", e.target.value)}
                                placeholder="예: VIP석"
                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">가격 (원)</label>
                            <input
                                type="number"
                                value={grade.price}
                                onChange={(e) => updateSeatGrade(index, "price", Number(e.target.value))}
                                min={0}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">좌석 수</label>
                            <input
                                type="number"
                                value={grade.totalSeats}
                                onChange={(e) => updateSeatGrade(index, "totalSeats", Number(e.target.value))}
                                min={0}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                  ))}
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 좌석 등급을 설정하면 예매 시 각 등급별로 좌석을 구분하여 보여줍니다.
                    실제 좌석 배치는 상품 등록 후 별도로 설정할 수 있습니다.
                  </p>
                </div>
              </div>
          )}

          {/* Step 5: 확인 */}
          {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  등록 정보 확인
                </h2>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">기본 정보</h3>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      <dt className="text-gray-500">상품명</dt>
                      <dd className="text-gray-900 dark:text-white">{formData.name || "-"}</dd>
                      <dt className="text-gray-500">유형</dt>
                      <dd className="text-gray-900 dark:text-white">{PRODUCT_TYPE_LABELS[formData.productType]}</dd>
                      <dt className="text-gray-500">러닝타임</dt>
                      <dd className="text-gray-900 dark:text-white">{formData.runningTime}분</dd>
                    </dl>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">일정 & 장소</h3>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      <dt className="text-gray-500">공연 기간</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {formData.startAt ? new Date(formData.startAt).toLocaleString("ko-KR") : "-"} ~<br />
                        {formData.endAt ? new Date(formData.endAt).toLocaleString("ko-KR") : "-"}
                      </dd>
                      <dt className="text-gray-500">판매 기간</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {formData.saleStartAt ? new Date(formData.saleStartAt).toLocaleString("ko-KR") : "-"} ~<br />
                        {formData.saleEndAt ? new Date(formData.saleEndAt).toLocaleString("ko-KR") : "-"}
                      </dd>
                      <dt className="text-gray-500">공연장</dt>
                      <dd className="text-gray-900 dark:text-white">{selectedArtHall?.name || "-"}</dd>
                      <dt className="text-gray-500">스테이지</dt>
                      <dd className="text-gray-900 dark:text-white">{selectedStage?.name || "-"}</dd>
                    </dl>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">좌석 등급</h3>
                    <div className="space-y-2">
                      {formData.seatGrades.map((grade, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-500">{grade.gradeName || `등급 ${index + 1}`}</span>
                            <span className="text-gray-900 dark:text-white">
                        {grade.price.toLocaleString()}원 × {grade.totalSeats}석
                      </span>
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
          )}

          {/* 네비게이션 버튼 */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                disabled={currentStep === 1}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← 이전
            </button>

            <div className="flex items-center gap-3">
              {currentStep === totalSteps ? (
                  <>
                    <button
                        type="button"
                        onClick={() => handleSubmit(true)}
                        disabled={isSubmitting}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      임시저장
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSubmit(false)}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-rose-600 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? "등록 중..." : "등록하기"}
                    </button>
                  </>
              ) : (
                  <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => prev + 1)}
                      className="px-6 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-rose-600 transition-colors"
                  >
                    다음 →
                  </button>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}