"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  ProductType,
  AgeRating,
  PRODUCT_TYPE_LABELS,
  AGE_RATING_LABELS,
  ProductCreateRequest,
  SeatGradeRequest,
  SeatCreateRequest,
} from "@/types/product";
import { ArtHallListResponse, StageListResponse, StageSeatListItem } from "@/types/venue";
import { cn } from "@/lib/utils";
import SeatGrid, { SeatGrade, SeatData } from "@/components/common/SeatGrid";

const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />,
});

type TabType = "basic" | "venue" | "content" | "policy" | "review";
const TABS: { key: TabType; label: string; step: number }[] = [
  { key: "basic", label: "1. 기본 정보", step: 1 },
  { key: "venue", label: "2. 장소 & 좌석", step: 2 },
  { key: "content", label: "3. 상세 콘텐츠", step: 3 },
  { key: "policy", label: "4. 정책 설정", step: 4 },
  { key: "review", label: "5. 최종 확인", step: 5 },
];

const GRADE_COLORS = [
  { name: "VIP", color: "bg-purple-500" },
  { name: "R", color: "bg-amber-500" },
  { name: "S", color: "bg-blue-500" },
  { name: "A", color: "bg-green-500" },
  { name: "B", color: "bg-teal-500" },
];

export default function SellerProductNewPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 기본 정보
  const [basicInfo, setBasicInfo] = useState({
    name: "", productType: "CONCERT" as ProductType, runningTime: 120,
    startAt: "", endAt: "", saleStartAt: "", saleEndAt: "",
  });

  // 장소 정보
  const [artHalls, setArtHalls] = useState<ArtHallListResponse[]>([]);
  const [stages, setStages] = useState<StageListResponse[]>([]);
  const [selectedArtHall, setSelectedArtHall] = useState<ArtHallListResponse | null>(null);
  const [selectedStage, setSelectedStage] = useState<StageListResponse | null>(null);

  // 좌석 정보
  const [seatDataMap, setSeatDataMap] = useState<Map<string, SeatData>>(new Map());
  const [grades, setGrades] = useState<SeatGrade[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);

  // 콘텐츠 & 정책 - detailImageUrls를 배열로 변경
  const [contentInfo, setContentInfo] = useState({
    description: "", posterImageUrl: "", detailImageUrls: [] as string[],
    castInfo: "", notice: "", organizer: "", agency: "",
  });
  const [policyInfo, setPolicyInfo] = useState({
    ageRating: "ALL" as AgeRating, restrictionNotice: "", maxTicketsPerPerson: 4,
    idVerificationRequired: false, transferable: true, admissionMinutesBefore: 30,
    lateEntryAllowed: false, lateEntryNotice: "", hasIntermission: false,
    intermissionMinutes: 15, photographyAllowed: false, foodAllowed: false,
    cancellable: true, cancelDeadlineDays: 7, refundPolicyText: "",
  });
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [isUploadingDetail, setIsUploadingDetail] = useState(false);
  const [isDraggingPoster, setIsDraggingPoster] = useState(false);
  const [isDraggingDetail, setIsDraggingDetail] = useState(false);

  // 유효성 검사
  const validateBasicInfo = useCallback(() => !!(
      basicInfo.name.trim() && basicInfo.startAt && basicInfo.endAt &&
      basicInfo.saleStartAt && basicInfo.saleEndAt && basicInfo.runningTime > 0
  ), [basicInfo]);

  const validateVenueInfo = useCallback(() => {
    if (!selectedArtHall || !selectedStage || grades.length === 0) return false;
    const assigned = Array.from(seatDataMap.values()).filter(s => s.gradeId).length;
    if (assigned === 0) return false;
    return grades.every(g => g.price > 0);
  }, [selectedArtHall, selectedStage, grades, seatDataMap]);

  useEffect(() => {
    const newCompleted = new Set<number>();
    if (validateBasicInfo()) newCompleted.add(1);
    if (validateBasicInfo() && validateVenueInfo()) newCompleted.add(2);
    if (validateBasicInfo() && validateVenueInfo()) newCompleted.add(3);
    if (validateBasicInfo() && validateVenueInfo()) newCompleted.add(4);
    setCompletedSteps(newCompleted);
  }, [validateBasicInfo, validateVenueInfo]);

  const canAccessTab = (tab: TabType) => {
    const t = TABS.find(x => x.key === tab);
    return t ? (t.step === 1 || completedSteps.has(t.step - 1)) : false;
  };

  // 데이터 로드
  useEffect(() => {
    fetch("/api/arthalls?status=ACTIVE").then(r => r.json()).then(d => {
      setArtHalls(d.data?.content || d.content || []);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedArtHall) { setStages([]); setSelectedStage(null); return; }
    fetch(`/api/arthalls/${selectedArtHall.id}/stages`).then(r => r.json()).then(d => {
      const list = d.data?.content || d.content || d.data || d || [];
      setStages(Array.isArray(list) ? list : []);
    }).catch(console.error);
  }, [selectedArtHall]);

  useEffect(() => {
    if (!selectedStage) { setSeatDataMap(new Map()); setGrades([]); setSelectedGradeId(null); return; }
    fetch(`/api/arthalls/stages/${selectedStage.stageId}/stage-seats`).then(r => r.json()).then(d => {
      const seats = d.data?.content || d.content || [];
      const map = new Map<string, SeatData>();
      seats.forEach((s: StageSeatListItem & { stageSeatId?: number }) => {
        if (s.status === "ACTIVE") {
          map.set(`${s.row}-${s.col}`, {
            stageSeatId: s.stageSeatId || s.id, seatNumber: s.seatNumber,
            status: s.status, row: s.row, col: s.col, vector: s.vector, gradeId: undefined,
          });
        }
      });
      setSeatDataMap(map);
    }).catch(console.error);
  }, [selectedStage]);

  // 등급 관리
  const addGrade = () => {
    const used = grades.map(g => g.name);
    const c = GRADE_COLORS.find(x => !used.includes(x.name)) || GRADE_COLORS[0];
    const ng: SeatGrade = { id: `grade-${Date.now()}`, name: c.name, price: 0, color: c.color };
    setGrades([...grades, ng]);
    setSelectedGradeId(ng.id);
  };

  const removeGrade = (id: string) => {
    setGrades(grades.filter(g => g.id !== id));
    setSeatDataMap(prev => {
      const m = new Map(prev);
      m.forEach((s, k) => { if (s.gradeId === id) m.set(k, { ...s, gradeId: undefined }); });
      return m;
    });
    if (selectedGradeId === id) setSelectedGradeId(null);
  };

  const updateGrade = (id: string, f: keyof SeatGrade, v: string | number) => {
    setGrades(grades.map(g => g.id === id ? { ...g, [f]: v } : g));
  };

  // 좌석 업데이트
  const handleSeatUpdate = useCallback((key: string, gradeId: string | undefined) => {
    setSeatDataMap(prev => {
      const m = new Map(prev);
      const s = m.get(key);
      if (s) m.set(key, { ...s, gradeId });
      return m;
    });
  }, []);

  const selectAllSeats = () => {
    if (!selectedGradeId) { alert("등급을 먼저 선택하세요."); return; }
    setSeatDataMap(prev => {
      const m = new Map(prev);
      m.forEach((s, k) => m.set(k, { ...s, gradeId: selectedGradeId }));
      return m;
    });
  };

  const clearAllSeats = () => {
    setSeatDataMap(prev => {
      const m = new Map(prev);
      m.forEach((s, k) => m.set(k, { ...s, gradeId: undefined }));
      return m;
    });
  };

  const clearCurrentGradeSeats = () => {
    if (!selectedGradeId) return;
    setSeatDataMap(prev => {
      const m = new Map(prev);
      m.forEach((s, k) => { if (s.gradeId === selectedGradeId) m.set(k, { ...s, gradeId: undefined }); });
      return m;
    });
  };

  // 파일 업로드
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch("/api/file/upload", { method: "POST", body: fd });
      if (r.ok) {
        const d = await r.json();
        return d.data?.url || d.data?.streamUrl || null;
      }
      return null;
    } catch (e) { console.error(e); return null; }
  };

  // 포스터 업로드
  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPoster(true);
    try {
      const url = await uploadFile(file);
      if (url) setContentInfo({ ...contentInfo, posterImageUrl: url });
    } catch (e) { console.error(e); }
    setIsUploadingPoster(false);
  };

  // 포스터 드래그 앤 드롭
  const handlePosterDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPoster(true);
  };

  const handlePosterDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPoster(false);
  };

  const handlePosterDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPoster(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(f => f.type.startsWith("image/"));
    if (!imageFile) return;

    setIsUploadingPoster(true);
    try {
      const url = await uploadFile(imageFile);
      if (url) setContentInfo({ ...contentInfo, posterImageUrl: url });
    } catch (e) { console.error(e); }
    setIsUploadingPoster(false);
  };

  // 상세 이미지 업로드 (여러 장)
  const handleDetailImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingDetail(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadFile(file);
        if (url) newUrls.push(url);
      }
      if (newUrls.length > 0) {
        setContentInfo({ ...contentInfo, detailImageUrls: [...contentInfo.detailImageUrls, ...newUrls] });
      }
    } catch (e) { console.error(e); }
    setIsUploadingDetail(false);
    e.target.value = "";
  };

  // 상세 이미지 드래그 앤 드롭
  const handleDetailDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDetail(true);
  };

  const handleDetailDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDetail(false);
  };

  const handleDetailDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDetail(false);

    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length === 0) return;

    // 최대 10장 제한
    const remaining = 10 - contentInfo.detailImageUrls.length;
    const filesToUpload = files.slice(0, remaining);
    if (filesToUpload.length === 0) return;

    setIsUploadingDetail(true);
    try {
      const newUrls: string[] = [];
      for (const file of filesToUpload) {
        const url = await uploadFile(file);
        if (url) newUrls.push(url);
      }
      if (newUrls.length > 0) {
        setContentInfo({ ...contentInfo, detailImageUrls: [...contentInfo.detailImageUrls, ...newUrls] });
      }
    } catch (e) { console.error(e); }
    setIsUploadingDetail(false);
  };

  // 상세 이미지 삭제
  const removeDetailImage = (index: number) => {
    setContentInfo({
      ...contentInfo,
      detailImageUrls: contentInfo.detailImageUrls.filter((_, i) => i !== index),
    });
  };

  // 폼 데이터 생성
  const buildFormData = (): ProductCreateRequest => {
    const seatGradeInfos: SeatGradeRequest[] = grades.map(g => ({
      gradeName: g.name, price: g.price,
      totalSeats: Array.from(seatDataMap.values()).filter(s => s.gradeId === g.id).length,
    }));
    const seatCreateInfos: SeatCreateRequest[] = Array.from(seatDataMap.values())
    .filter(s => s.gradeId)
    .map(s => {
      const g = grades.find(x => x.id === s.gradeId)!;
      return { seatNumber: s.seatNumber, grade: g.name, price: g.price };
    });

    // datetime-local은 초가 없으므로 :00 추가
    const formatDateTime = (dt: string) => dt ? (dt.length === 16 ? dt + ":00" : dt) : "";

    return {
      name: basicInfo.name, productType: basicInfo.productType, runningTime: basicInfo.runningTime,
      startAt: formatDateTime(basicInfo.startAt), endAt: formatDateTime(basicInfo.endAt),
      saleStartAt: formatDateTime(basicInfo.saleStartAt), saleEndAt: formatDateTime(basicInfo.saleEndAt),
      stageId: selectedStage!.stageId, stageName: selectedStage!.name,
      artHallId: selectedArtHall!.id, artHallName: selectedArtHall!.name, artHallAddress: selectedArtHall!.address,
      description: contentInfo.description || undefined, posterImageUrl: contentInfo.posterImageUrl || undefined,
      detailImageUrls: contentInfo.detailImageUrls.length > 0 ? JSON.stringify(contentInfo.detailImageUrls) : undefined,
      castInfo: contentInfo.castInfo || undefined,
      notice: contentInfo.notice || undefined, organizer: contentInfo.organizer || undefined,
      agency: contentInfo.agency || undefined, ageRating: policyInfo.ageRating,
      restrictionNotice: policyInfo.restrictionNotice || undefined, maxTicketsPerPerson: policyInfo.maxTicketsPerPerson,
      idVerificationRequired: policyInfo.idVerificationRequired, transferable: policyInfo.transferable,
      admissionMinutesBefore: policyInfo.admissionMinutesBefore, lateEntryAllowed: policyInfo.lateEntryAllowed,
      lateEntryNotice: policyInfo.lateEntryNotice || undefined, hasIntermission: policyInfo.hasIntermission,
      intermissionMinutes: policyInfo.intermissionMinutes, photographyAllowed: policyInfo.photographyAllowed,
      foodAllowed: policyInfo.foodAllowed, cancellable: policyInfo.cancellable,
      cancelDeadlineDays: policyInfo.cancelDeadlineDays, refundPolicyText: policyInfo.refundPolicyText || undefined,
      seatGradeInfos, seatCreateInfos,
    };
  };

  const handleSaveDraft = async () => {
    if (!validateBasicInfo()) { setError("기본 정보를 입력해주세요."); return; }
    setIsSubmitting(true); setError(null);
    try {
      const r = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildFormData()) });
      if (!r.ok) throw new Error((await r.json()).error || "저장 실패");
      const d = await r.json();
      // data가 직접 ID 값인 경우 처리 (예: { data: 14 })
      const productId = typeof d.data === 'number' ? d.data : (d.data?.id || d.id);
      alert("임시저장되었습니다.");
      router.push(`/seller/products/${productId}`);
    } catch (e) { setError(e instanceof Error ? e.message : "저장 실패"); }
    setIsSubmitting(false);
  };

  const handleSubmitForReview = async () => {
    if (!validateBasicInfo() || !validateVenueInfo()) { setError("모든 필수 정보를 입력해주세요."); return; }
    setIsSubmitting(true); setError(null);
    try {
      const cr = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildFormData()) });
      if (!cr.ok) throw new Error((await cr.json()).error || "생성 실패");
      const cd = await cr.json();
      // data가 직접 ID 값인 경우 처리 (예: { data: 14 })
      const productId = typeof cd.data === 'number' ? cd.data : (cd.data?.id || cd.id);
      const sr = await fetch(`/api/products/${productId}/submit`, { method: "POST" });
      if (!sr.ok) throw new Error((await sr.json()).error || "심사 요청 실패");
      alert("심사 요청 완료!");
      router.push("/seller/products");
    } catch (e) { setError(e instanceof Error ? e.message : "심사 요청 실패"); }
    setIsSubmitting(false);
  };

  const goNext = () => {
    const i = TABS.findIndex(t => t.key === activeTab);
    if (i < TABS.length - 1 && canAccessTab(TABS[i + 1].key)) setActiveTab(TABS[i + 1].key);
  };
  const goPrev = () => {
    const i = TABS.findIndex(t => t.key === activeTab);
    if (i > 0) setActiveTab(TABS[i - 1].key);
  };

  const totalSeats = seatDataMap.size;
  const assignedSeats = Array.from(seatDataMap.values()).filter(s => s.gradeId).length;

  return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">새 상품 등록</h1>
          <p className="text-gray-500 mt-1">단계별로 정보를 입력하고 심사를 요청하세요.</p>
        </div>

        {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
        )}

        {/* 진행 바 */}
        <div className="flex items-center gap-2">
          {TABS.map((tab, i) => {
            const done = completedSteps.has(tab.step);
            const active = activeTab === tab.key;
            const accessible = canAccessTab(tab.key);
            return (
                <div key={tab.key} className="flex items-center flex-1">
                  <button
                      onClick={() => accessible && setActiveTab(tab.key)}
                      disabled={!accessible}
                      className={cn("flex-1 py-3 px-2 text-xs font-medium rounded-lg transition-all",
                          active ? "bg-emerald-500 text-white"
                              : done ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                  : accessible ? "bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200"
                                      : "bg-gray-50 dark:bg-gray-900 text-gray-400 cursor-not-allowed"
                      )}
                  >
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.step}</span>
                    {done && !active && <span className="ml-1">✓</span>}
                  </button>
                  {i < TABS.length - 1 && <div className={cn("w-4 h-0.5 mx-1", done ? "bg-emerald-300" : "bg-gray-200 dark:bg-gray-700")} />}
                </div>
            );
          })}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          {/* 기본 정보 */}
          {activeTab === "basic" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">기본 정보</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">상품명 *</label>
                    <input type="text" value={basicInfo.name} onChange={e => setBasicInfo({ ...basicInfo, name: e.target.value })}
                           className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" placeholder="예: 2025 아이유 콘서트" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">상품 유형 *</label>
                    <select value={basicInfo.productType} onChange={e => setBasicInfo({ ...basicInfo, productType: e.target.value as ProductType })}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      {Object.entries(PRODUCT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">러닝타임 (분) *</label>
                    <input type="number" value={basicInfo.runningTime} onChange={e => setBasicInfo({ ...basicInfo, runningTime: parseInt(e.target.value) || 0 })}
                           className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" />
                  </div>
                  <div><label className="block text-sm font-medium mb-2">공연 시작일 *</label>
                    <input type="datetime-local" value={basicInfo.startAt} onChange={e => setBasicInfo({ ...basicInfo, startAt: e.target.value })}
                           className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" /></div>
                  <div><label className="block text-sm font-medium mb-2">공연 종료일 *</label>
                    <input type="datetime-local" value={basicInfo.endAt} onChange={e => setBasicInfo({ ...basicInfo, endAt: e.target.value })}
                           className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" /></div>
                  <div><label className="block text-sm font-medium mb-2">판매 시작일 *</label>
                    <input type="datetime-local" value={basicInfo.saleStartAt} onChange={e => setBasicInfo({ ...basicInfo, saleStartAt: e.target.value })}
                           className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" /></div>
                  <div><label className="block text-sm font-medium mb-2">판매 종료일 *</label>
                    <input type="datetime-local" value={basicInfo.saleEndAt} onChange={e => setBasicInfo({ ...basicInfo, saleEndAt: e.target.value })}
                           className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" /></div>
                </div>
                <div className={cn("p-4 rounded-lg", validateBasicInfo() ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200" : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200", "border")}>
                  <p className={cn("text-sm", validateBasicInfo() ? "text-emerald-700" : "text-yellow-700")}>
                    {validateBasicInfo() ? "✓ 기본 정보 완료. 다음 단계로 진행하세요." : "⚠ 모든 필수 항목을 입력해주세요."}
                  </p>
                </div>
              </div>
          )}

          {/* 장소 & 좌석 */}
          {activeTab === "venue" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">장소 & 좌석</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">공연장 *</label>
                    <select value={selectedArtHall?.id || ""} onChange={e => { setSelectedArtHall(artHalls.find(h => h.id === +e.target.value) || null); setSelectedStage(null); }}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <option value="">선택</option>
                      {artHalls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">스테이지 *</label>
                    <select value={selectedStage?.stageId || ""} onChange={e => setSelectedStage(stages.find(s => s.stageId === +e.target.value) || null)}
                            disabled={!selectedArtHall} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50">
                      <option value="">선택</option>
                      {stages.map(s => <option key={s.stageId} value={s.stageId}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                {selectedStage && seatDataMap.size > 0 && (
                    <>
                      {/* 등급 관리 */}
                      <div className="border-t pt-6">
                        <div className="flex justify-between mb-4">
                          <div><h3 className="font-semibold">좌석 등급 설정 *</h3><p className="text-xs text-gray-500">{totalSeats}석 중 {assignedSeats}석 할당</p></div>
                          <button onClick={addGrade} disabled={grades.length >= 5} className="px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50">+ 등급 추가</button>
                        </div>
                        {grades.length === 0 ? <p className="text-gray-500 text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">등급을 추가하세요.</p> : (
                            <div className="space-y-3">
                              {grades.map(g => {
                                const cnt = Array.from(seatDataMap.values()).filter(s => s.gradeId === g.id).length;
                                const sel = selectedGradeId === g.id;
                                return (
                                    <div key={g.id} className={cn("flex items-center gap-3 p-4 rounded-lg border-2", sel ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "border-gray-200 dark:border-gray-700")}>
                                      <div className={cn("w-6 h-6 rounded", g.color)} />
                                      <input type="text" value={g.name} onChange={e => updateGrade(g.id, "name", e.target.value)} className="w-20 px-2 py-1.5 text-sm border rounded" />
                                      <input type="number" value={g.price} onChange={e => updateGrade(g.id, "price", +e.target.value || 0)} className="w-28 px-2 py-1.5 text-sm border rounded" placeholder="가격" />
                                      <span className="text-sm text-gray-500">원</span>
                                      <span className="text-sm text-gray-500 min-w-[50px]">{cnt}석</span>
                                      <button onClick={() => setSelectedGradeId(sel ? null : g.id)} className={cn("px-3 py-1.5 text-xs rounded", sel ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200")}>{sel ? "선택됨" : "좌석 지정"}</button>
                                      <button onClick={() => removeGrade(g.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">✕</button>
                                    </div>
                                );
                              })}
                            </div>
                        )}
                      </div>

                      {/* 좌석 배치도 */}
                      <div className="border-t pt-6">
                        <div className="flex justify-between mb-4">
                          <div><h3 className="font-semibold">좌석 배치도</h3><p className="text-xs text-gray-500">등급 선택 후 클릭/드래그하여 지정</p></div>
                          <div className="flex gap-2">
                            {selectedGradeId && <><button onClick={selectAllSeats} className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded">전체 선택</button>
                              <button onClick={clearCurrentGradeSeats} className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 rounded">현재 등급 해제</button></>}
                            <button onClick={clearAllSeats} className="px-3 py-1.5 text-xs bg-red-100 text-red-600 rounded">전체 해제</button>
                          </div>
                        </div>
                        {selectedGradeId && <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"><p className="text-sm text-emerald-700">🎯 <strong>{grades.find(g => g.id === selectedGradeId)?.name}</strong> 등급 지정 중</p></div>}
                        <SeatGrid mode="grade" seatDataMap={seatDataMap} grades={grades} selectedGradeId={selectedGradeId} onSeatUpdate={handleSeatUpdate} />
                      </div>

                      <div className={cn("p-4 rounded-lg border", validateVenueInfo() ? "bg-emerald-50 border-emerald-200" : "bg-yellow-50 border-yellow-200")}>
                        <p className={cn("text-sm", validateVenueInfo() ? "text-emerald-700" : "text-yellow-700")}>
                          {validateVenueInfo() ? `✓ 완료 (총 ${assignedSeats}석)` : "⚠ 등급 추가 + 가격 설정 + 좌석 할당 필요"}
                        </p>
                      </div>
                    </>
                )}
              </div>
          )}

          {/* 콘텐츠 */}
          {activeTab === "content" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">상세 콘텐츠 <span className="text-xs text-gray-400">(선택)</span></h2>
                {/* 포스터 */}
                <div>
                  <label className="block text-sm font-medium mb-2">포스터</label>
                  <div
                      className={cn(
                          "relative",
                          isDraggingPoster && "ring-2 ring-emerald-500 ring-offset-2 rounded-lg"
                      )}
                      onDragOver={handlePosterDragOver}
                      onDragLeave={handlePosterDragLeave}
                      onDrop={handlePosterDrop}
                  >
                    <div className="flex items-start gap-4">
                      {contentInfo.posterImageUrl ? (
                          <div className="relative w-32 h-44 rounded-lg overflow-hidden border">
                            <Image src={contentInfo.posterImageUrl} alt="포스터" fill className="object-cover" />
                            <button onClick={() => setContentInfo({ ...contentInfo, posterImageUrl: "" })} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full">✕</button>
                          </div>
                      ) : (
                          <label className={cn(
                              "w-32 h-44 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                              isDraggingPoster ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "hover:border-emerald-500"
                          )}>
                            {isUploadingPoster ? (
                                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            ) : isDraggingPoster ? (
                                <><span className="text-2xl text-emerald-500">📥</span><span className="text-xs text-emerald-600 mt-2">여기에 놓기</span></>
                            ) : (
                                <><span className="text-3xl text-gray-400">+</span><span className="text-xs text-gray-500 mt-2">업로드</span><span className="text-xs text-gray-400">드래그 가능</span></>
                            )}
                            <input type="file" accept="image/*" className="hidden" onChange={handlePosterUpload} disabled={isUploadingPoster} />
                          </label>
                      )}
                    </div>
                  </div>
                </div>
                {/* 상세 이미지 (여러 장) */}
                <div>
                  <label className="block text-sm font-medium mb-2">상세 이미지 (최대 10장)</label>
                  <div
                      className={cn(
                          "p-4 border-2 border-dashed rounded-lg transition-colors",
                          isDraggingDetail ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "border-gray-200 dark:border-gray-700"
                      )}
                      onDragOver={handleDetailDragOver}
                      onDragLeave={handleDetailDragLeave}
                      onDrop={handleDetailDrop}
                  >
                    {isDraggingDetail && (
                        <div className="text-center py-4 mb-3">
                          <span className="text-2xl">📥</span>
                          <p className="text-sm text-emerald-600 mt-1">이미지를 여기에 놓으세요</p>
                        </div>
                    )}
                    <div className="flex flex-wrap gap-3">
                      {contentInfo.detailImageUrls.map((url, idx) => (
                          <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                            <Image src={url} alt={`상세 ${idx + 1}`} fill className="object-cover" />
                            <button onClick={() => removeDetailImage(idx)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full text-xs">✕</button>
                          </div>
                      ))}
                      {contentInfo.detailImageUrls.length < 10 && !isDraggingDetail && (
                          <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:border-emerald-500">
                            {isUploadingDetail ? <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /> : <><span className="text-2xl text-gray-400">+</span><span className="text-xs text-gray-500">추가</span></>}
                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleDetailImageUpload} disabled={isUploadingDetail} />
                          </label>
                      )}
                    </div>
                    {!isDraggingDetail && (
                        <p className="text-xs text-gray-500 mt-3">
                          {contentInfo.detailImageUrls.length}/10장 · 이미지를 드래그하여 추가할 수 있습니다
                        </p>
                    )}
                  </div>
                </div>
                <div><label className="block text-sm font-medium mb-2">상세 설명</label>
                  <RichTextEditor value={contentInfo.description} onChange={v => setContentInfo({ ...contentInfo, description: v })} placeholder="상세 설명 입력" /></div>
                <div><label className="block text-sm font-medium mb-2">출연진</label>
                  <textarea value={contentInfo.castInfo} onChange={e => setContentInfo({ ...contentInfo, castInfo: e.target.value })} rows={3} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-lg resize-none" placeholder="출연진 정보를 입력하세요" /></div>
                <div><label className="block text-sm font-medium mb-2">공지사항 / 유의사항</label>
                  <textarea value={contentInfo.notice} onChange={e => setContentInfo({ ...contentInfo, notice: e.target.value })} rows={3} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-lg resize-none" placeholder="관람객에게 안내할 공지사항을 입력하세요" /></div>
                <div className="grid grid-cols-2 gap-6">
                  <div><label className="block text-sm font-medium mb-2">주최</label><input type="text" value={contentInfo.organizer} onChange={e => setContentInfo({ ...contentInfo, organizer: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-lg" placeholder="주최사 이름" /></div>
                  <div><label className="block text-sm font-medium mb-2">기획사</label><input type="text" value={contentInfo.agency} onChange={e => setContentInfo({ ...contentInfo, agency: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-lg" placeholder="기획사 이름" /></div>
                </div>
              </div>
          )}

          {/* 정책 */}
          {activeTab === "policy" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">정책 설정</h2>
                {/* 관람 제한 */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 border-b pb-2">🎭 관람 제한</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium mb-2">관람 등급</label>
                      <select value={policyInfo.ageRating} onChange={e => setPolicyInfo({ ...policyInfo, ageRating: e.target.value as AgeRating })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-lg">
                        {Object.entries(AGE_RATING_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select></div>
                    <div><label className="block text-sm font-medium mb-2">추가 제한사항 안내</label>
                      <input type="text" value={policyInfo.restrictionNotice} onChange={e => setPolicyInfo({ ...policyInfo, restrictionNotice: e.target.value })} placeholder="예: 36개월 미만 입장 불가" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-lg" /></div>
                  </div>
                </div>
                {/* 예매 정책 */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 border-b pb-2">🎫 예매 정책</h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div><label className="block text-sm font-medium mb-2">인당 최대 구매</label>
                      <input type="number" value={policyInfo.maxTicketsPerPerson} onChange={e => setPolicyInfo({ ...policyInfo, maxTicketsPerPerson: +e.target.value || 1 })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-lg" /></div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={policyInfo.idVerificationRequired} onChange={e => setPolicyInfo({ ...policyInfo, idVerificationRequired: e.target.checked })} className="w-4 h-4 rounded" />
                      <span className="text-sm">본인확인 필수</span></label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={policyInfo.transferable} onChange={e => setPolicyInfo({ ...policyInfo, transferable: e.target.checked })} className="w-4 h-4 rounded" />
                      <span className="text-sm">양도 가능</span></label>
                  </div>
                </div>
                {/* 입장 정책 */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 border-b pb-2">🚪 입장 정책</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium mb-2">입장 시작 (공연 N분 전)</label>
                      <input type="number" value={policyInfo.admissionMinutesBefore} onChange={e => setPolicyInfo({ ...policyInfo, admissionMinutesBefore: +e.target.value || 0 })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-lg" /></div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={policyInfo.lateEntryAllowed} onChange={e => setPolicyInfo({ ...policyInfo, lateEntryAllowed: e.target.checked })} className="w-4 h-4 rounded" />
                      <span className="text-sm">지각 입장 허용</span></label>
                  </div>
                  {policyInfo.lateEntryAllowed && <div><label className="block text-sm font-medium mb-2">지각 입장 안내</label>
                    <input type="text" value={policyInfo.lateEntryNotice} onChange={e => setPolicyInfo({ ...policyInfo, lateEntryNotice: e.target.value })} placeholder="예: 1막 종료 후 입장 가능" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-lg" /></div>}
                  <div className="grid grid-cols-2 gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={policyInfo.hasIntermission} onChange={e => setPolicyInfo({ ...policyInfo, hasIntermission: e.target.checked })} className="w-4 h-4 rounded" />
                      <span className="text-sm">인터미션 있음</span></label>
                    {policyInfo.hasIntermission && <div><label className="block text-sm font-medium mb-2">인터미션 시간 (분)</label>
                      <input type="number" value={policyInfo.intermissionMinutes} onChange={e => setPolicyInfo({ ...policyInfo, intermissionMinutes: +e.target.value || 0 })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-lg" /></div>}
                  </div>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={policyInfo.photographyAllowed} onChange={e => setPolicyInfo({ ...policyInfo, photographyAllowed: e.target.checked })} className="w-4 h-4 rounded" />
                      <span className="text-sm">촬영 허용</span></label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={policyInfo.foodAllowed} onChange={e => setPolicyInfo({ ...policyInfo, foodAllowed: e.target.checked })} className="w-4 h-4 rounded" />
                      <span className="text-sm">음식물 반입 허용</span></label>
                  </div>
                </div>
                {/* 환불 정책 */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 border-b pb-2">💰 환불 정책</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={policyInfo.cancellable} onChange={e => setPolicyInfo({ ...policyInfo, cancellable: e.target.checked })} className="w-4 h-4 rounded" />
                      <span className="text-sm">취소 가능</span></label>
                    {policyInfo.cancellable && <div><label className="block text-sm font-medium mb-2">취소 마감 (공연 N일 전)</label>
                      <input type="number" value={policyInfo.cancelDeadlineDays} onChange={e => setPolicyInfo({ ...policyInfo, cancelDeadlineDays: +e.target.value || 0 })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-lg" /></div>}
                  </div>
                  {policyInfo.cancellable && <div><label className="block text-sm font-medium mb-2">환불 정책 상세</label>
                    <textarea value={policyInfo.refundPolicyText} onChange={e => setPolicyInfo({ ...policyInfo, refundPolicyText: e.target.value })} rows={3} placeholder="예: 관람일 7일 전까지 전액 환불, 3일 전까지 50% 환불" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-lg resize-none" /></div>}
                </div>
              </div>
          )}

          {/* 최종 확인 */}
          {activeTab === "review" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">최종 확인</h2>
                <div className="grid grid-cols-2 gap-8">
                  <div><h3 className="font-semibold border-b pb-2 mb-4">기본 정보</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between"><dt className="text-gray-500">상품명</dt><dd className="font-medium">{basicInfo.name || "-"}</dd></div>
                      <div className="flex justify-between"><dt className="text-gray-500">유형</dt><dd>{PRODUCT_TYPE_LABELS[basicInfo.productType]}</dd></div>
                      <div className="flex justify-between"><dt className="text-gray-500">러닝타임</dt><dd>{basicInfo.runningTime}분</dd></div>
                    </dl>
                  </div>
                  <div><h3 className="font-semibold border-b pb-2 mb-4">장소 정보</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between"><dt className="text-gray-500">공연장</dt><dd>{selectedArtHall?.name || "-"}</dd></div>
                      <div className="flex justify-between"><dt className="text-gray-500">스테이지</dt><dd>{selectedStage?.name || "-"}</dd></div>
                      <div className="flex justify-between"><dt className="text-gray-500">좌석</dt><dd>{assignedSeats}석</dd></div>
                    </dl>
                  </div>
                  <div><h3 className="font-semibold border-b pb-2 mb-4">정책 요약</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between"><dt className="text-gray-500">관람등급</dt><dd>{AGE_RATING_LABELS[policyInfo.ageRating]}</dd></div>
                      <div className="flex justify-between"><dt className="text-gray-500">인당 최대</dt><dd>{policyInfo.maxTicketsPerPerson}매</dd></div>
                      <div className="flex justify-between"><dt className="text-gray-500">양도</dt><dd>{policyInfo.transferable ? "가능" : "불가"}</dd></div>
                      <div className="flex justify-between"><dt className="text-gray-500">취소</dt><dd>{policyInfo.cancellable ? `가능 (${policyInfo.cancelDeadlineDays}일 전까지)` : "불가"}</dd></div>
                    </dl>
                  </div>
                  <div><h3 className="font-semibold border-b pb-2 mb-4">콘텐츠</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between"><dt className="text-gray-500">포스터</dt><dd>{contentInfo.posterImageUrl ? "등록됨" : "미등록"}</dd></div>
                      <div className="flex justify-between"><dt className="text-gray-500">상세이미지</dt><dd>{contentInfo.detailImageUrls.length}장</dd></div>
                      <div className="flex justify-between"><dt className="text-gray-500">주최</dt><dd>{contentInfo.organizer || "-"}</dd></div>
                    </dl>
                  </div>
                  <div className="col-span-2"><h3 className="font-semibold border-b pb-2 mb-4">좌석 등급</h3>
                    <div className="grid grid-cols-4 gap-3">
                      {grades.map(g => {
                        const c = Array.from(seatDataMap.values()).filter(s => s.gradeId === g.id).length;
                        return <div key={g.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><div className="flex items-center gap-2 mb-1"><div className={cn("w-4 h-4 rounded", g.color)} /><span className="font-medium">{g.name}</span></div><p className="text-sm text-gray-600">{g.price.toLocaleString()}원 · {c}석</p></div>;
                      })}
                    </div>
                  </div>
                </div>
                {(!validateBasicInfo() || !validateVenueInfo()) && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">⚠️ 필수 항목을 완료해주세요</p>
                    </div>
                )}
              </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-between pt-4 border-t">
          <button onClick={goPrev} disabled={activeTab === "basic"} className="px-4 py-2 text-gray-600 disabled:opacity-50">← 이전</button>
          <div className="flex gap-3">
            <button onClick={handleSaveDraft} disabled={isSubmitting} className="px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50">{isSubmitting ? "저장 중..." : "임시저장"}</button>
            {activeTab === "review" ? (
                <button onClick={handleSubmitForReview} disabled={isSubmitting || !validateBasicInfo() || !validateVenueInfo()} className="px-6 py-2 bg-emerald-500 text-white rounded-lg disabled:opacity-50">{isSubmitting ? "요청 중..." : "심사 요청"}</button>
            ) : (
                <button onClick={goNext} disabled={!canAccessTab(TABS[TABS.findIndex(t => t.key === activeTab) + 1]?.key)} className="px-6 py-2 bg-emerald-500 text-white rounded-lg disabled:opacity-50">다음 →</button>
            )}
          </div>
        </div>
      </div>
  );
}