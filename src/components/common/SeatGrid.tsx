"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

// 그리드 설정
const GRID_COLS = 60;
const GRID_ROWS = 25;
const BASE_WIDTH = 1200;
const BASE_HEIGHT = 1000;
const CELL_WIDTH = BASE_WIDTH / GRID_COLS;
const CELL_HEIGHT = BASE_HEIGHT / GRID_ROWS;

const getRowLabel = (row: number): string => String.fromCharCode(65 + row);

// ========== 타입 정의 ==========

export interface SeatGrade {
  id: string;
  name: string;
  price: number;
  color: string;
}

export interface SeatData {
  stageSeatId: number;
  seatNumber: string;
  status: string;
  row: number;
  col: number;
  vector: number[];
  gradeId?: string;
}

export interface SelectedSeat {
  row: number;
  col: number;
  seatNumber: string;
  vectorX: number;
  vectorY: number;
}

export interface StageSeatInfo {
  stageSeatId?: number;
  id?: number;
  seatNumber: string;
  row: number;
  col: number;
  status: string;
}

export interface ReservationSeatInfo {
  id: number;
  seatNumber: string;
  grade: string;
  price: number;
  status: "AVAILABLE" | "PREEMPTED" | "RESERVED";
}

// 예약 모드용 - 선택 가능한 좌석 정보
export interface SelectableSeatInfo extends ReservationSeatInfo {
  row: number;
  col: number;
  stageSeatId: number;
}

// ========== Props 타입 ==========

interface BaseProps {
  className?: string;
}

interface PlacementModeProps extends BaseProps {
  mode: "placement";
  selectedSeats: Map<string, SelectedSeat>;
  onSeatToggle: (row: number, col: number, mode: "add" | "remove") => void;
}

interface GradeModeProps extends BaseProps {
  mode: "grade";
  seatDataMap: Map<string, SeatData>;
  grades: SeatGrade[];
  selectedGradeId: string | null;
  onSeatUpdate: (seatKey: string, gradeId: string | undefined) => void;
}

interface ViewModeProps extends BaseProps {
  mode: "view";
  stageSeats: StageSeatInfo[];
  reservationSeats: ReservationSeatInfo[];
}

interface ReservationModeProps extends BaseProps {
  mode: "reservation";
  stageSeats: StageSeatInfo[];
  reservationSeats: ReservationSeatInfo[];
  selectedSeatIds: Set<number>;
  maxSeats: number;
  onSeatSelect: (seat: SelectableSeatInfo) => void;
}

type SeatGridProps = PlacementModeProps | GradeModeProps | ViewModeProps | ReservationModeProps;

// ========== 유틸리티 함수 ==========

export const generateSeatNumber = (row: number, col: number): string => {
  return `${getRowLabel(row)}${col + 1}`;
};

export const calculateVector = (row: number, col: number): [number, number] => {
  const vectorX = col * CELL_WIDTH + CELL_WIDTH / 2;
  const vectorY = row * CELL_HEIGHT + CELL_HEIGHT / 2;
  return [Math.round(vectorX * 10) / 10, Math.round(vectorY * 10) / 10];
};

// 등급별 색상 팔레트
const GRADE_COLOR_PALETTE = [
  { bg: "bg-purple-500", light: "bg-purple-100 dark:bg-purple-900/40", border: "border-purple-300 dark:border-purple-600", text: "text-purple-700 dark:text-purple-300" },
  { bg: "bg-amber-500", light: "bg-amber-100 dark:bg-amber-900/40", border: "border-amber-300 dark:border-amber-600", text: "text-amber-700 dark:text-amber-300" },
  { bg: "bg-blue-500", light: "bg-blue-100 dark:bg-blue-900/40", border: "border-blue-300 dark:border-blue-600", text: "text-blue-700 dark:text-blue-300" },
  { bg: "bg-emerald-500", light: "bg-emerald-100 dark:bg-emerald-900/40", border: "border-emerald-300 dark:border-emerald-600", text: "text-emerald-700 dark:text-emerald-300" },
  { bg: "bg-rose-500", light: "bg-rose-100 dark:bg-rose-900/40", border: "border-rose-300 dark:border-rose-600", text: "text-rose-700 dark:text-rose-300" },
  { bg: "bg-cyan-500", light: "bg-cyan-100 dark:bg-cyan-900/40", border: "border-cyan-300 dark:border-cyan-600", text: "text-cyan-700 dark:text-cyan-300" },
  { bg: "bg-indigo-500", light: "bg-indigo-100 dark:bg-indigo-900/40", border: "border-indigo-300 dark:border-indigo-600", text: "text-indigo-700 dark:text-indigo-300" },
  { bg: "bg-orange-500", light: "bg-orange-100 dark:bg-orange-900/40", border: "border-orange-300 dark:border-orange-600", text: "text-orange-700 dark:text-orange-300" },
];

// ========== 컴포넌트 ==========

export default function SeatGrid(props: SeatGridProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"add" | "remove" | "assign">("add");

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ========== 배치 모드 ==========
  if (props.mode === "placement") {
    const { selectedSeats, onSeatToggle, className } = props;

    const handleMouseDown = (row: number, col: number) => {
      const key = `${row}-${col}`;
      const mode = selectedSeats.has(key) ? "remove" : "add";
      setDragMode(mode);
      setIsDragging(true);
      onSeatToggle(row, col, mode);
    };

    const handleMouseEnter = (row: number, col: number) => {
      if (!isDragging) return;
      onSeatToggle(row, col, dragMode as "add" | "remove");
    };

    return (
        <div
            className={cn("bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 overflow-x-auto", className)}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
          <div className="flex justify-center mb-6">
            <div className="px-16 py-4 bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-t-3xl text-center">
              <span className="text-gray-700 dark:text-gray-200 font-medium">STAGE</span>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="inline-block select-none">
              <div className="flex mb-1">
                <div className="w-8" />
                {Array.from({ length: GRID_COLS }, (_, col) => (
                    <div key={col} className="w-7 h-6 flex items-center justify-center text-xs text-gray-400">{col + 1}</div>
                ))}
              </div>

              {Array.from({ length: GRID_ROWS }, (_, row) => (
                  <div key={row} className="flex">
                    <div className="w-8 h-7 flex items-center justify-center text-xs text-gray-400 font-medium">{getRowLabel(row)}</div>
                    {Array.from({ length: GRID_COLS }, (_, col) => {
                      const key = `${row}-${col}`;
                      const isSelected = selectedSeats.has(key);
                      return (
                          <div
                              key={col}
                              onMouseDown={(e) => { e.preventDefault(); handleMouseDown(row, col); }}
                              onMouseEnter={() => handleMouseEnter(row, col)}
                              className={cn(
                                  "w-7 h-7 border border-gray-200 dark:border-gray-700 cursor-pointer transition-colors flex items-center justify-center text-[10px]",
                                  isSelected ? "bg-blue-500 border-blue-600 text-white font-medium" : "bg-gray-50 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                              )}
                          >
                            {isSelected && <span className="truncate">{selectedSeats.get(key)?.seatNumber}</span>}
                          </div>
                      );
                    })}
                  </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-500 rounded" />
              <span>선택된 좌석 ({selectedSeats.size}개)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded" />
              <span>빈 공간</span>
            </div>
          </div>
        </div>
    );
  }

  // ========== 예약 모드 ==========
  if (props.mode === "reservation") {
    const { stageSeats, reservationSeats, selectedSeatIds, maxSeats, onSeatSelect, className } = props;

    if (stageSeats.length === 0) {
      return <div className="text-center py-8 text-gray-500">좌석 정보가 없습니다.</div>;
    }

    const reservationMap = new Map<string, ReservationSeatInfo>();
    reservationSeats.forEach((seat) => reservationMap.set(seat.seatNumber, seat));

    const rows = stageSeats.map(s => s.row);
    const cols = stageSeats.map(s => s.col);
    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);

    const stageSeatMap = new Map<string, StageSeatInfo>();
    stageSeats.forEach((seat) => stageSeatMap.set(`${seat.row}-${seat.col}`, seat));

    const gradeNames = [...new Set(reservationSeats.map(s => s.grade))];
    const gradeColorMap = new Map<string, typeof GRADE_COLOR_PALETTE[0]>();
    gradeNames.forEach((grade, index) => {
      gradeColorMap.set(grade, GRADE_COLOR_PALETTE[index % GRADE_COLOR_PALETTE.length]);
    });

    const stats = {
      total: reservationSeats.length,
      available: reservationSeats.filter(s => s.status === "AVAILABLE").length,
      selected: selectedSeatIds.size,
    };

    return (
        <div className={cn("border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900", className)}>
          <div className="flex flex-wrap gap-3 p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">좌석 등급:</span>
            {gradeNames.map((grade) => {
              const color = gradeColorMap.get(grade)!;
              const gradeSeats = reservationSeats.filter(s => s.grade === grade);
              const available = gradeSeats.filter(s => s.status === "AVAILABLE").length;
              const price = gradeSeats[0]?.price || 0;
              return (
                  <div key={grade} className="flex items-center gap-1.5">
                    <div className={cn("w-5 h-5 rounded border", color.light, color.border)} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{grade}</span>
                    <span className="text-sm text-gray-500">{price.toLocaleString()}원</span>
                    <span className={cn("text-xs px-1.5 py-0.5 rounded", available === 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700")}>
                  {available === 0 ? "매진" : `${available}석`}
                </span>
                  </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-4 p-3 text-sm border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-orange-500 border border-orange-600" />
              <span className="text-gray-600 dark:text-gray-400">선택됨 ({stats.selected}/{maxSeats})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-yellow-200 dark:bg-yellow-900/50 border border-yellow-300" />
              <span className="text-gray-600 dark:text-gray-400">선점 중</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gray-300 dark:bg-gray-700 border border-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">예약됨</span>
            </div>
          </div>

          <div className="flex justify-center py-4">
            <div className="px-12 py-2 bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-t-2xl text-center">
              <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">STAGE</span>
            </div>
          </div>

          <div className="flex justify-center overflow-x-auto px-4 pb-4">
            <div className="inline-block select-none">
              <div className="flex mb-1">
                <div className="w-6" />
                {Array.from({ length: maxCol - minCol + 1 }, (_, i) => (
                    <div key={i} className="w-8 h-5 flex items-center justify-center text-[9px] text-gray-400">{minCol + i + 1}</div>
                ))}
              </div>

              {Array.from({ length: maxRow - minRow + 1 }, (_, rowOffset) => {
                const rowIndex = minRow + rowOffset;
                return (
                    <div key={rowIndex} className="flex">
                      <div className="w-6 h-8 flex items-center justify-center text-[9px] text-gray-400 font-medium">{getRowLabel(rowIndex)}</div>
                      {Array.from({ length: maxCol - minCol + 1 }, (_, colOffset) => {
                        const colIndex = minCol + colOffset;
                        const seatKey = `${rowIndex}-${colIndex}`;
                        const stageSeat = stageSeatMap.get(seatKey);

                        if (!stageSeat) {
                          return <div key={colIndex} className="w-8 h-8 bg-gray-100 dark:bg-gray-800" />;
                        }

                        const reservationSeat = reservationMap.get(stageSeat.seatNumber);
                        if (!reservationSeat) {
                          return <div key={colIndex} className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-sm" title={`${stageSeat.seatNumber} - 정보 없음`} />;
                        }

                        const stageSeatId = stageSeat.id || stageSeat.stageSeatId || 0;
                        const isSelected = selectedSeatIds.has(reservationSeat.id);
                        const isAvailable = reservationSeat.status === "AVAILABLE";
                        const gradeColor = gradeColorMap.get(reservationSeat.grade);

                        const selectableSeat: SelectableSeatInfo = {
                          ...reservationSeat,
                          row: stageSeat.row,
                          col: stageSeat.col,
                          stageSeatId,
                        };

                        let seatStyle = "";
                        if (isSelected) {
                          seatStyle = "bg-orange-500 text-white border-orange-600 shadow-lg scale-105";
                        } else if (!isAvailable) {
                          if (reservationSeat.status === "PREEMPTED") {
                            seatStyle = "bg-yellow-200 dark:bg-yellow-900/50 text-yellow-600 border-yellow-300 cursor-not-allowed";
                          } else {
                            seatStyle = "bg-gray-300 dark:bg-gray-700 text-gray-500 border-gray-400 cursor-not-allowed";
                          }
                        } else if (gradeColor) {
                          seatStyle = `${gradeColor.light} ${gradeColor.text} ${gradeColor.border} hover:opacity-80 cursor-pointer`;
                        }

                        return (
                            <button
                                key={colIndex}
                                onClick={() => (isAvailable || isSelected) && onSeatSelect(selectableSeat)}
                                disabled={!isAvailable && !isSelected}
                                className={cn("w-8 h-8 rounded text-[10px] font-medium border transition-all duration-150 flex items-center justify-center", seatStyle)}
                                title={`${reservationSeat.seatNumber} - ${reservationSeat.grade} (${reservationSeat.price.toLocaleString()}원)`}
                            >
                              {reservationSeat.status === "RESERVED" ? "×" : stageSeat.seatNumber.slice(-2)}
                            </button>
                        );
                      })}
                    </div>
                );
              })}
            </div>
          </div>
        </div>
    );
  }

  // ========== 조회 모드 ==========
  if (props.mode === "view") {
    const { stageSeats, reservationSeats, className } = props;

    if (stageSeats.length === 0) {
      return <div className="text-center py-8 text-gray-500">좌석 정보가 없습니다.</div>;
    }

    const reservationMap = new Map<string, ReservationSeatInfo>();
    reservationSeats.forEach((seat) => reservationMap.set(seat.seatNumber, seat));

    const rows = stageSeats.map(s => s.row);
    const cols = stageSeats.map(s => s.col);
    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);

    const stageSeatMap = new Map<string, StageSeatInfo>();
    stageSeats.forEach((seat) => stageSeatMap.set(`${seat.row}-${seat.col}`, seat));

    const stats = {
      total: reservationSeats.length,
      available: reservationSeats.filter(s => s.status === "AVAILABLE").length,
      preempted: reservationSeats.filter(s => s.status === "PREEMPTED").length,
      reserved: reservationSeats.filter(s => s.status === "RESERVED").length,
    };

    const gradeStats = reservationSeats.reduce((acc, seat) => {
      if (!acc[seat.grade]) acc[seat.grade] = { total: 0, available: 0, reserved: 0, preempted: 0, price: seat.price };
      acc[seat.grade].total++;
      if (seat.status === "AVAILABLE") acc[seat.grade].available++;
      if (seat.status === "RESERVED") acc[seat.grade].reserved++;
      if (seat.status === "PREEMPTED") acc[seat.grade].preempted++;
      return acc;
    }, {} as Record<string, { total: number; available: number; reserved: number; preempted: number; price: number }>);

    const getStatusColor = (status: string) => {
      switch (status) {
        case "AVAILABLE": return "bg-green-500 hover:bg-green-600";
        case "PREEMPTED": return "bg-yellow-500 hover:bg-yellow-600";
        case "RESERVED": return "bg-blue-500 hover:bg-blue-600";
        default: return "bg-gray-400";
      }
    };

    return (
        <div className={cn("border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900", className)}>
          <div className="flex justify-center py-4">
            <div className="px-12 py-2 bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-t-2xl text-center">
              <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">STAGE</span>
            </div>
          </div>

          <div className="flex justify-center overflow-x-auto px-4 pb-4">
            <div className="inline-block select-none">
              <div className="flex mb-1">
                <div className="w-6" />
                {Array.from({ length: maxCol - minCol + 1 }, (_, i) => (
                    <div key={i} className="w-6 h-5 flex items-center justify-center text-[9px] text-gray-400">{minCol + i + 1}</div>
                ))}
              </div>

              {Array.from({ length: maxRow - minRow + 1 }, (_, rowOffset) => {
                const rowIndex = minRow + rowOffset;
                return (
                    <div key={rowIndex} className="flex">
                      <div className="w-6 h-6 flex items-center justify-center text-[9px] text-gray-400 font-medium">{getRowLabel(rowIndex)}</div>
                      {Array.from({ length: maxCol - minCol + 1 }, (_, colOffset) => {
                        const colIndex = minCol + colOffset;
                        const stageSeat = stageSeatMap.get(`${rowIndex}-${colIndex}`);
                        if (!stageSeat) return <div key={colIndex} className="w-6 h-6 bg-gray-100 dark:bg-gray-800" />;
                        const reservationSeat = reservationMap.get(stageSeat.seatNumber);
                        if (reservationSeat) {
                          return (
                              <div
                                  key={colIndex}
                                  className={cn("w-6 h-6 flex items-center justify-center text-[8px] font-bold text-white rounded-sm", getStatusColor(reservationSeat.status))}
                                  title={`${reservationSeat.seatNumber} - ${reservationSeat.grade} (${reservationSeat.price.toLocaleString()}원)`}
                              >
                                {reservationSeat.grade[0]}
                              </div>
                          );
                        }
                        return <div key={colIndex} className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-sm" title={`${stageSeat.seatNumber} - 정보 없음`} />;
                      })}
                    </div>
                );
              })}
            </div>
          </div>

          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-green-500 rounded-sm" />
                <span className="text-gray-600">예매가능 ({stats.available})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-yellow-500 rounded-sm" />
                <span className="text-gray-600">선점중 ({stats.preempted})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-blue-500 rounded-sm" />
                <span className="text-gray-600">예약완료 ({stats.reserved})</span>
              </div>
            </div>

            {Object.keys(gradeStats).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap justify-center gap-2 text-xs">
                    {Object.entries(gradeStats).map(([grade, s]) => (
                        <div key={grade} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                          <span className="font-medium">{grade}</span>
                          <span className="text-gray-500 ml-1">({s.price.toLocaleString()}원)</span>
                          <span className="ml-2">
                      <span className="text-green-600">{s.available}</span>
                            {s.preempted > 0 && <span className="text-yellow-600 ml-1">/{s.preempted}</span>}
                            {s.reserved > 0 && <span className="text-blue-600 ml-1">/{s.reserved}</span>}
                            <span className="text-gray-400">/{s.total}</span>
                    </span>
                        </div>
                    ))}
                  </div>
                </div>
            )}
          </div>
        </div>
    );
  }

  // ========== 등급 지정 모드 ==========
  const { seatDataMap, grades, selectedGradeId, onSeatUpdate, className } = props;

  if (seatDataMap.size === 0) {
    return <div className="text-center py-12 text-gray-500">스테이지를 선택하면 좌석 배치도가 표시됩니다.</div>;
  }

  const handleMouseDown = (seatKey: string, seat: SeatData) => {
    if (!selectedGradeId) return;
    const mode = seat.gradeId === selectedGradeId ? "remove" : "assign";
    setDragMode(mode);
    setIsDragging(true);
    onSeatUpdate(seatKey, mode === "remove" ? undefined : selectedGradeId);
  };

  const handleMouseEnter = (seatKey: string) => {
    if (!isDragging || !selectedGradeId) return;
    onSeatUpdate(seatKey, dragMode === "remove" ? undefined : selectedGradeId);
  };

  const totalSeats = seatDataMap.size;
  const assignedSeatsCount = Array.from(seatDataMap.values()).filter((s) => s.gradeId).length;
  const gradeSeatsCount = grades.reduce((acc, grade) => {
    acc[grade.id] = Array.from(seatDataMap.values()).filter((s) => s.gradeId === grade.id).length;
    return acc;
  }, {} as Record<string, number>);

  return (
       <div
          className={cn("overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900", className)}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
      >
        <div className="flex justify-center mb-4">
          <div className="px-16 py-3 bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-t-3xl text-center">
            <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">STAGE</span>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="inline-block select-none">
            <div className="flex mb-1">
              <div className="w-6" />
              {Array.from({ length: GRID_COLS }, (_, col) => (
                  <div key={col} className="w-5 h-5 flex items-center justify-center text-[9px] text-gray-400">{col + 1}</div>
              ))}
            </div>

            {Array.from({ length: GRID_ROWS }, (_, rowIndex) => (
                <div key={rowIndex} className="flex">
                  <div className="w-6 h-5 flex items-center justify-center text-[9px] text-gray-400 font-medium">{getRowLabel(rowIndex)}</div>
                  {Array.from({ length: GRID_COLS }, (_, colIndex) => {
                    const seatKey = `${rowIndex}-${colIndex}`;
                    const seat = seatDataMap.get(seatKey);
                    if (!seat) {
                      return <div key={colIndex} className="w-5 h-5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />;
                    }
                    const grade = seat.gradeId ? grades.find((g) => g.id === seat.gradeId) : null;
                    return (
                        <div
                            key={colIndex}
                            onMouseDown={(e) => { e.preventDefault(); handleMouseDown(seatKey, seat); }}
                            onMouseEnter={() => handleMouseEnter(seatKey)}
                            className={cn(
                                "w-5 h-5 border cursor-pointer transition-all flex items-center justify-center text-[8px] font-bold",
                                grade ? `${grade.color} text-white border-transparent` : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600",
                                selectedGradeId && !grade && "hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-400"
                            )}
                            title={`${seat.seatNumber}${grade ? ` - ${grade.name} (${grade.price.toLocaleString()}원)` : " - 미지정"}`}
                        >
                          {grade?.name?.[0] || ""}
                        </div>
                    );
                  })}
                </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
            <span className="text-gray-500">좌석 없음</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
            <span className="text-gray-500">미지정 ({totalSeats - assignedSeatsCount}석)</span>
          </div>
          {grades.map((grade) => (
              <div key={grade.id} className="flex items-center gap-1.5">
                <div className={cn("w-4 h-4", grade.color)} />
                <span className="text-gray-700 dark:text-gray-300">{grade.name} ({grade.price.toLocaleString()}원) - {gradeSeatsCount[grade.id] || 0}석</span>
              </div>
          ))}
        </div>
      </div>
  );
}