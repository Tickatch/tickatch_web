"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
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

// 더미 공연장 상세
const DUMMY_ART_HALL: ArtHallDetailResponse = {
  id: 1,
  name: "올림픽공원 KSPO DOME",
  address: "서울특별시 송파구 올림픽로 424",
  status: "ACTIVE",
  createdAt: "2025-01-01T10:00:00",
  createdBy: "admin",
  updatedAt: "2025-02-15T14:30:00",
  updatedBy: "admin",
  deletedAt: null,
};

// 더미 스테이지 목록
const DUMMY_STAGES: StageListResponse[] = [
  { stageId: 1, artHallId: 1, name: "메인홀", status: "ACTIVE", createdAt: "2025-01-01T10:00:00" },
  { stageId: 2, artHallId: 1, name: "소홀 A", status: "ACTIVE", createdAt: "2025-01-02T11:00:00" },
  { stageId: 3, artHallId: 1, name: "소홀 B", status: "INACTIVE", createdAt: "2025-01-03T09:00:00" },
];

export default function AdminArtHallDetailPage() {
  const router = useRouter();
  const params = useParams();
  const artHallId = params.id;

  const [artHall, setArtHall] = useState<ArtHallDetailResponse | null>(null);
  const [stages, setStages] = useState<StageListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", address: "", status: "ACTIVE" as ArtHallStatus });

  useEffect(() => {
    // TODO: 실제 API 호출
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setArtHall({ ...DUMMY_ART_HALL, id: Number(artHallId) });
        setStages(DUMMY_STAGES);
        setEditForm({
          name: DUMMY_ART_HALL.name,
          address: DUMMY_ART_HALL.address,
          status: DUMMY_ART_HALL.status,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [artHallId]);

  const handleSave = async () => {
    try {
      // TODO: 실제 API 호출
      await new Promise((resolve) => setTimeout(resolve, 500));
      setArtHall((prev) => prev ? { ...prev, ...editForm } : null);
      setIsEditing(false);
      alert("저장되었습니다.");
    } catch (error) {
      alert("저장에 실패했습니다.");
    }
  };

  const handleStatusChange = async (newStatus: ArtHallStatus) => {
    if (!artHall) return;

    const confirmed = confirm(`상태를 "${ART_HALL_STATUS_LABELS[newStatus]}"(으)로 변경하시겠습니까?`);
    if (!confirmed) return;

    try {
      // TODO: 실제 API 호출
      await new Promise((resolve) => setTimeout(resolve, 500));
      setArtHall({ ...artHall, status: newStatus });
      setEditForm((prev) => ({ ...prev, status: newStatus }));
      alert("상태가 변경되었습니다.");
    } catch (error) {
      alert("상태 변경에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  if (!artHall) {
    return (
        <div className="text-center py-12">
          <p className="text-gray-500">공연장을 찾을 수 없습니다.</p>
          <Link href="/admin/arthalls" className="text-blue-500 hover:underline mt-2 inline-block">
            목록으로 돌아가기
          </Link>
        </div>
    );
  }

  return (
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
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    취소
                  </button>
                  <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-colors"
                  >
                    저장
                  </button>
                </>
            ) : (
                <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-colors"
                >
                  수정
                </button>
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
                  <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">스테이지</h2>
            <Link
                href={`/admin/arthalls/${artHallId}/stages/new`}
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              스테이지 추가
            </Link>
          </div>

          {stages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">등록된 스테이지가 없습니다.</p>
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
                            className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          상세
                        </Link>
                        <Link
                            href={`/admin/arthalls/${artHallId}/stages/${stage.stageId}/seats`}
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
  );
}