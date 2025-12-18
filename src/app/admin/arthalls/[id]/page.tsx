"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { cn } from "@/lib/utils";
import {
  ArtHallDetailResponse,
  ArtHallStatus,
  ART_HALL_STATUS_LABELS,
  getArtHallStatusColor,
  StageListResponse,
  STAGE_STATUS_LABELS,
  getStageStatusColor,
} from "@/types/venue";
import { ApiResponse, PageResponse } from "@/types/api";

// 다음 주소 API 타입
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeResult) => void;
      }) => { open: () => void };
    };
  }
}

interface DaumPostcodeResult {
  zonecode: string;
  address: string;
  roadAddress: string;
  jibunAddress: string;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function AdminArtHallDetailPage({ params }: Props) {
  const { id: artHallId } = use(params);
  const router = useRouter();

  const [artHall, setArtHall] = useState<ArtHallDetailResponse | null>(null);
  const [stages, setStages] = useState<StageListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", address: "" });
  const [isSaving, setIsSaving] = useState(false);

  // 데이터 조회
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 공연장 상세 조회
        const artHallRes = await fetch(`/api/arthalls/${artHallId}`);
        const artHallData: ApiResponse<ArtHallDetailResponse> = await artHallRes.json();

        if (!artHallRes.ok || !artHallData.success) {
          throw new Error(artHallData.error?.message || "공연장 조회에 실패했습니다.");
        }

        setArtHall(artHallData.data!);
        setEditForm({
          name: artHallData.data!.name,
          address: artHallData.data!.address,
        });

        // 스테이지 목록 조회
        const stagesRes = await fetch(`/api/arthalls/${artHallId}/stages`);
        const stagesData: ApiResponse<PageResponse<StageListResponse>> = await stagesRes.json();

        if (stagesRes.ok && stagesData.success) {
          setStages(stagesData.data?.content || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "데이터 조회에 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [artHallId]);

  // 주소 검색
  const openAddressSearch = () => {
    if (!window.daum) {
      alert("주소 검색 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data: DaumPostcodeResult) => {
        const fullAddress = data.roadAddress || data.jibunAddress;
        setEditForm((prev) => ({ ...prev, address: fullAddress }));
      },
    }).open();
  };

  // 저장
  const handleSave = async () => {
    if (!editForm.name.trim()) {
      alert("공연장명을 입력해주세요.");
      return;
    }
    if (!editForm.address.trim()) {
      alert("주소를 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/arthalls/${artHallId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          address: editForm.address.trim(),
          status: artHall?.status || "ACTIVE",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "저장에 실패했습니다.");
      }

      setArtHall((prev) => prev ? { ...prev, name: editForm.name, address: editForm.address } : null);
      setIsEditing(false);
      alert("저장되었습니다.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 상태 변경
  const handleStatusChange = async (newStatus: ArtHallStatus) => {
    if (!artHall) return;

    const confirmed = confirm(`상태를 "${ART_HALL_STATUS_LABELS[newStatus]}"(으)로 변경하시겠습니까?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/arthalls/${artHallId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "상태 변경에 실패했습니다.");
      }

      setArtHall({ ...artHall, status: newStatus });
      alert("상태가 변경되었습니다.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "상태 변경에 실패했습니다.");
    }
  };

  // 공연장 삭제
  const handleDelete = async () => {
    const confirmed = confirm("정말로 이 공연장을 삭제하시겠습니까?\n연결된 스테이지와 좌석도 함께 삭제됩니다.");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/arthalls/${artHallId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || "삭제에 실패했습니다.");
      }

      alert("공연장이 삭제되었습니다.");
      router.push("/admin/arthalls");
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  if (error || !artHall) {
    return (
        <div className="text-center py-12">
          <p className="text-gray-500">{error || "공연장을 찾을 수 없습니다."}</p>
          <Link href="/admin/arthalls" className="text-blue-500 hover:underline mt-2 inline-block">
            목록으로 돌아가기
          </Link>
        </div>
    );
  }

  return (
      <>
        <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" />

        <div className="space-y-6">
          {/* 페이지 헤더 */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                    href="/admin/arthalls"
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ← 목록
                </Link>
                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getArtHallStatusColor(artHall.status))}>
                {ART_HALL_STATUS_LABELS[artHall.status]}
              </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {artHall.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {artHall.address}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {artHall.status === "ACTIVE" ? (
                  <button
                      onClick={() => handleStatusChange("INACTIVE")}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    운영 중지
                  </button>
              ) : (
                  <button
                      onClick={() => handleStatusChange("ACTIVE")}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    운영 시작
                  </button>
              )}
              {isEditing ? (
                  <>
                    <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({ name: artHall.name, address: artHall.address });
                        }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      취소
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? "저장 중..." : "저장"}
                    </button>
                  </>
              ) : (
                  <>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-colors"
                    >
                      수정
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      삭제
                    </button>
                  </>
              )}
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">기본 정보</h2>

            {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      공연장명
                    </label>
                    <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      주소
                    </label>
                    <div className="flex gap-2">
                      <input
                          type="text"
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                          type="button"
                          onClick={openAddressSearch}
                          className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        주소 검색
                      </button>
                    </div>
                  </div>
                </div>
            ) : (
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">공연장명</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white font-medium">{artHall.name}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">주소</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">{artHall.address}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">등록일</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      {new Date(artHall.createdAt).toLocaleString("ko-KR")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">최근 수정</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      {new Date(artHall.updatedAt).toLocaleString("ko-KR")}
                    </dd>
                  </div>
                </dl>
            )}
          </div>

          {/* 스테이지 목록 */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                스테이지 ({stages.length})
              </h2>
              <Link
                  href={`/admin/arthalls/${artHallId}/stages/new`}
                  className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                스테이지 추가
              </Link>
            </div>

            {stages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">등록된 스테이지가 없습니다.</p>
                  <Link
                      href={`/admin/arthalls/${artHallId}/stages/new`}
                      className="text-blue-500 hover:underline"
                  >
                    첫 번째 스테이지 등록하기 →
                  </Link>
                </div>
            ) : (
                <div className="space-y-3">
                  {stages.map((stage) => (
                      <div
                          key={stage.stageId}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {stage.name}
                    </span>
                          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getStageStatusColor(stage.status))}>
                      {STAGE_STATUS_LABELS[stage.status]}
                    </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                              href={`/admin/arthalls/${artHallId}/stages/${stage.stageId}`}
                              className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                          >
                            좌석 관리
                          </Link>
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </div>
      </>
  );
}