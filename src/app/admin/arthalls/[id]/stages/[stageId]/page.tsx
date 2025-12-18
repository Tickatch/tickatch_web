"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  StageDetailResponse,
  STAGE_STATUS_LABELS,
  getStageStatusColor,
  StageSeatListItem,
  StageSeatStatus,
} from "@/types/venue";
import { ApiResponse } from "@/types/api";
import SeatGrid, { SelectedSeat, generateSeatNumber, calculateVector } from "@/components/common/SeatGrid";

interface Props {
  params: Promise<{ id: string; stageId: string }>;
}

export default function StageDetailPage({ params }: Props) {
  const { id: artHallId, stageId } = use(params);
  const router = useRouter();

  const [stage, setStage] = useState<StageDetailResponse | null>(null);
  const [existingSeats, setExistingSeats] = useState<StageSeatListItem[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Map<string, SelectedSeat>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const stageRes = await fetch(`/api/arthalls/stages/${stageId}`);
        const stageData: ApiResponse<StageDetailResponse> = await stageRes.json();

        if (!stageRes.ok || !stageData.success) {
          throw new Error(stageData.error?.message || "스테이지 조회에 실패했습니다.");
        }

        setStage(stageData.data!);
        setEditName(stageData.data!.name);

        const seatsRes = await fetch(`/api/arthalls/stages/${stageId}/stage-seats`);
        const seatsData: ApiResponse<{ content: StageSeatListItem[] }> = await seatsRes.json();

        if (seatsRes.ok && seatsData.success) {
          const seats = seatsData.data?.content || [];
          setExistingSeats(seats);

          const seatMap = new Map<string, SelectedSeat>();
          seats.forEach((seat) => {
            const key = `${seat.row}-${seat.col}`;
            seatMap.set(key, {
              row: seat.row,
              col: seat.col,
              seatNumber: seat.seatNumber,
              vectorX: seat.vector[0],
              vectorY: seat.vector[1],
            });
          });
          setSelectedSeats(seatMap);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "데이터 조회에 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [stageId]);

  // 좌석 토글
  const handleSeatToggle = useCallback((row: number, col: number, mode: "add" | "remove") => {
    const key = `${row}-${col}`;

    setSelectedSeats((prev: Map<string, SelectedSeat>) => {
      const newMap = new Map(prev);

      if (mode === "remove") {
        newMap.delete(key);
      } else {
        const [vectorX, vectorY] = calculateVector(row, col);
        newMap.set(key, {
          row,
          col,
          seatNumber: generateSeatNumber(row, col),
          vectorX,
          vectorY,
        });
      }

      return newMap;
    });
  }, []);

  // 전체 선택
  const selectAll = () => {
    const newMap = new Map<string, SelectedSeat>();
    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 60; col++) {
        const key = `${row}-${col}`;
        const [vectorX, vectorY] = calculateVector(row, col);
        newMap.set(key, {
          row,
          col,
          seatNumber: generateSeatNumber(row, col),
          vectorX,
          vectorY,
        });
      }
    }
    setSelectedSeats(newMap);
  };

  // 전체 해제
  const clearAll = () => {
    setSelectedSeats(new Map());
  };

  // 좌석 저장
  const handleSaveSeats = async () => {
    if (selectedSeats.size === 0) {
      alert("배치할 좌석을 선택해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      // 기존 좌석 삭제
      if (existingSeats.length > 0) {
        const deleteRes = await fetch(`/api/arthalls/stages/stage-seats`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seatIds: existingSeats.map((s) => s.id) }),
        });

        if (!deleteRes.ok) {
          const data = await deleteRes.json();
          throw new Error(data.error || "기존 좌석 삭제에 실패했습니다.");
        }
      }

      // 새 좌석 생성
      const seatsToCreate = Array.from(selectedSeats.values()).map((seat: SelectedSeat) => ({
        seatNumber: seat.seatNumber,
        status: "ACTIVE" as StageSeatStatus,
        row: seat.row,
        col: seat.col,
        vectorX: seat.vectorX,
        vectorY: seat.vectorY,
      }));

      const createRes = await fetch(`/api/arthalls/stages/${stageId}/stage-seats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seatsToCreate),
      });

      const createData = await createRes.json();

      if (!createRes.ok) {
        throw new Error(createData.error || createData.message || "좌석 등록에 실패했습니다.");
      }

      alert(`${selectedSeats.size}개의 좌석이 저장되었습니다.`);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "좌석 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 스테이지 정보 저장
  const handleSaveStage = async () => {
    if (!editName.trim()) {
      alert("스테이지명을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`/api/arthalls/stages/${stageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), status: stage?.status || "ACTIVE" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "수정에 실패했습니다.");
      }

      setStage((prev: StageDetailResponse | null) => (prev ? { ...prev, name: editName.trim() } : null));
      setIsEditing(false);
      alert("스테이지 정보가 수정되었습니다.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "수정에 실패했습니다.");
    }
  };

  // 스테이지 삭제
  const handleDeleteStage = async () => {
    const confirmed = confirm("정말로 이 스테이지를 삭제하시겠습니까?\n모든 좌석도 함께 삭제됩니다.");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/arthalls/stages/${stageId}`, { method: "DELETE" });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || "삭제에 실패했습니다.");
      }

      alert("스테이지가 삭제되었습니다.");
      router.push(`/admin/arthalls/${artHallId}`);
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

  if (error || !stage) {
    return (
        <div className="text-center py-12">
          <p className="text-gray-500">{error || "스테이지를 찾을 수 없습니다."}</p>
          <Link href={`/admin/arthalls/${artHallId}`} className="text-blue-500 hover:underline mt-2 inline-block">
            공연장으로 돌아가기
          </Link>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div>
            <Link
                href={`/admin/arthalls/${artHallId}`}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-2 inline-block"
            >
              ← 공연장 상세
            </Link>
            <div className="flex items-center gap-3">
              {isEditing ? (
                  <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-2xl font-bold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1"
                  />
              ) : (
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{stage.name}</h1>
              )}
              <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStageStatusColor(stage.status))}>
              {STAGE_STATUS_LABELS[stage.status]}
            </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              좌석 배치를 관리합니다. 드래그하여 여러 좌석을 선택할 수 있습니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
                <>
                  <button
                      onClick={() => { setIsEditing(false); setEditName(stage.name); }}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400"
                  >
                    취소
                  </button>
                  <button onClick={handleSaveStage} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    저장
                  </button>
                </>
            ) : (
                <>
                  <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    수정
                  </button>
                  <button onClick={handleDeleteStage} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                    삭제
                  </button>
                </>
            )}
          </div>
        </div>

        {/* 도구 모음 */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              선택된 좌석: <span className="font-bold text-blue-500">{selectedSeats.size}개</span>
            </span>
              <span className="text-sm text-gray-500">그리드: 60열 × 25행</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                  onClick={selectAll}
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                전체 선택
              </button>
              <button
                  onClick={clearAll}
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                전체 해제
              </button>
              <button
                  onClick={handleSaveSeats}
                  disabled={isSaving}
                  className="px-4 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50"
              >
                {isSaving ? "저장 중..." : "좌석 저장"}
              </button>
            </div>
          </div>
        </div>

        {/* 좌석 배치 에디터 - 공통 컴포넌트 사용 */}
        <SeatGrid
            mode="placement"
            selectedSeats={selectedSeats}
            onSeatToggle={handleSeatToggle}
        />

        {/* 선택된 좌석 미리보기 */}
        {selectedSeats.size > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                선택된 좌석 ({selectedSeats.size}개)
              </h3>
              <div className="max-h-48 overflow-y-auto">
                <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-2">
                  {Array.from(selectedSeats.values())
                  .sort((a, b) => (a.row === b.row ? a.col - b.col : a.row - b.row))
                  .slice(0, 100)
                  .map((seat) => (
                      <div
                          key={`${seat.row}-${seat.col}`}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs text-center"
                      >
                        {seat.seatNumber}
                      </div>
                  ))}
                </div>
                {selectedSeats.size > 100 && (
                    <p className="text-center text-sm text-gray-500 mt-2">외 {selectedSeats.size - 100}개...</p>
                )}
              </div>
            </div>
        )}
      </div>
  );
}