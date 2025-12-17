"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

// ============================================
// 그리드 설정
// ============================================
export const GRID_SIZE = 100;
export const VECTOR_SCALE = 10;
const GRID_WIDTH = 1200; // 고정 너비 (정사각형)
const CELL_SIZE = GRID_WIDTH / GRID_SIZE; // 12px per cell
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

// 행 라벨 생성
export const getRowLabel = (row: number): string => {
  if (row < 26) return String.fromCharCode(65 + row);
  const first = Math.floor(row / 26) - 1;
  const second = row % 26;
  return String.fromCharCode(65 + first) + String.fromCharCode(65 + second);
};

export interface SelectedSeat {
  row: number;
  col: number;
  seatNumber: string;
  vectorX: number;
  vectorY: number;
}

export interface StageArea {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

export type StageShape = "top" | "center" | "bottom" | "left" | "right";

export const STAGE_SHAPES: { value: StageShape; label: string; description: string }[] = [
  { value: "top", label: "상단", description: "스테이지가 위쪽에 위치" },
  { value: "center", label: "중앙", description: "스테이지가 중앙에 위치 (360도)" },
  { value: "bottom", label: "하단", description: "스테이지가 아래쪽에 위치" },
  { value: "left", label: "좌측", description: "스테이지가 왼쪽에 위치" },
  { value: "right", label: "우측", description: "스테이지가 오른쪽에 위치" },
];

export const getStageArea = (shape: StageShape): StageArea => {
  switch (shape) {
    case "top":
      return { startRow: 0, endRow: 15, startCol: 25, endCol: 75 };
    case "center":
      return { startRow: 40, endRow: 60, startCol: 40, endCol: 60 };
    case "bottom":
      return { startRow: 85, endRow: 100, startCol: 25, endCol: 75 };
    case "left":
      return { startRow: 25, endRow: 75, startCol: 0, endCol: 15 };
    case "right":
      return { startRow: 25, endRow: 75, startCol: 85, endCol: 100 };
    default:
      return { startRow: 40, endRow: 60, startCol: 40, endCol: 60 };
  }
};

interface SeatGridEditorProps {
  selectedSeats: Map<string, SelectedSeat>;
  setSelectedSeats: React.Dispatch<React.SetStateAction<Map<string, SelectedSeat>>>;
  stageArea: StageArea;
}

export default function SeatGridEditor({
                                         selectedSeats,
                                         setSelectedSeats,
                                         stageArea,
                                       }: SeatGridEditorProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"add" | "remove">("add");
  const [dragStart, setDragStart] = useState<{ row: number; col: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ row: number; col: number } | null>(null);

  const generateSeatNumber = useCallback((row: number, col: number): string => {
    return `${getRowLabel(row)}${col + 1}`;
  }, []);

  const calculateVector = useCallback((row: number, col: number): [number, number] => {
    const vectorX = col * VECTOR_SCALE + VECTOR_SCALE / 2;
    const vectorY = row * VECTOR_SCALE + VECTOR_SCALE / 2;
    return [vectorX, vectorY];
  }, []);

  const isStageArea = useCallback(
      (row: number, col: number): boolean => {
        return (
            row >= stageArea.startRow &&
            row < stageArea.endRow &&
            col >= stageArea.startCol &&
            col < stageArea.endCol
        );
      },
      [stageArea]
  );

  const selectArea = useCallback(
      (startRow: number, startCol: number, endRow: number, endCol: number, mode: "add" | "remove") => {
        const minRow = Math.min(startRow, endRow);
        const maxRow = Math.max(startRow, endRow);
        const minCol = Math.min(startCol, endCol);
        const maxCol = Math.max(startCol, endCol);

        setSelectedSeats((prev) => {
          const newMap = new Map(prev);
          for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
              if (isStageArea(row, col)) continue;
              const key = `${row}-${col}`;
              if (mode === "remove") {
                newMap.delete(key);
              } else {
                const [vectorX, vectorY] = calculateVector(row, col);
                newMap.set(key, { row, col, seatNumber: generateSeatNumber(row, col), vectorX, vectorY });
              }
            }
          }
          return newMap;
        });
      },
      [calculateVector, generateSeatNumber, isStageArea, setSelectedSeats]
  );

  const handleMouseDown = (e: React.MouseEvent, row: number, col: number) => {
    if (e.button === 1 || e.ctrlKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }
    if (isStageArea(row, col)) return;
    const key = `${row}-${col}`;
    const mode = selectedSeats.has(key) ? "remove" : "add";
    setDragMode(mode);
    setIsDragging(true);
    setDragStart({ row, col });
    setDragEnd({ row, col });
  };

  const handleMouseMove = (e: React.MouseEvent, row?: number, col?: number) => {
    if (isPanning) {
      setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }
    if (isDragging && row !== undefined && col !== undefined) {
      setDragEnd({ row, col });
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    if (isDragging && dragStart && dragEnd) {
      selectArea(dragStart.row, dragStart.col, dragEnd.row, dragEnd.col, dragMode);
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      handleZoom(e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP);
    }
  };

  const resetView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const getDragArea = () => {
    if (!dragStart || !dragEnd) return null;
    return {
      minRow: Math.min(dragStart.row, dragEnd.row),
      maxRow: Math.max(dragStart.row, dragEnd.row),
      minCol: Math.min(dragStart.col, dragEnd.col),
      maxCol: Math.max(dragStart.col, dragEnd.col),
    };
  };

  const isInDragArea = (row: number, col: number): boolean => {
    const area = getDragArea();
    if (!area) return false;
    return row >= area.minRow && row <= area.maxRow && col >= area.minCol && col <= area.maxCol;
  };

  const cellSizeWithZoom = CELL_SIZE * zoom;
  const gridSizeWithZoom = GRID_WIDTH * zoom;

  return (
      <div onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        {/* 줌 컨트롤 - 중앙 정렬 */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
              onClick={() => handleZoom(-ZOOM_STEP)}
              disabled={zoom <= MIN_ZOOM}
              className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            −
          </button>
          <span className="w-16 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">
          {Math.round(zoom * 100)}%
        </span>
          <button
              onClick={() => handleZoom(ZOOM_STEP)}
              disabled={zoom >= MAX_ZOOM}
              className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            +
          </button>
          <button
              onClick={resetView}
              className="ml-2 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            리셋
          </button>
        </div>

        {/* 그리드 컨테이너 - 중앙 정렬 */}
        <div
            ref={gridRef}
            className="overflow-auto relative flex justify-center"
            style={{ maxHeight: "70vh" }}
            onWheel={handleWheel}
        >
          <div
              className="select-none"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
                cursor: isPanning ? "grabbing" : isDragging ? "crosshair" : "default",
                width: gridSizeWithZoom,
                height: gridSizeWithZoom,
                flexShrink: 0,
              }}
          >
            {/* 그리드 - CSS Grid로 정확한 정사각형 */}
            <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                  gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
                  width: "100%",
                  height: "100%",
                  border: "1px solid #d1d5db",
                }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
                const row = Math.floor(index / GRID_SIZE);
                const col = index % GRID_SIZE;
                const key = `${row}-${col}`;
                const isSelected = selectedSeats.has(key);
                const isStage = isStageArea(row, col);
                const inDrag = isInDragArea(row, col) && !isStage;

                return (
                    <div
                        key={key}
                        onMouseDown={(e) => handleMouseDown(e, row, col)}
                        onMouseEnter={() => handleMouseMove({} as React.MouseEvent, row, col)}
                        className={cn(
                            "border-r border-b border-gray-200 dark:border-gray-700 transition-colors",
                            isStage
                                ? "bg-gradient-to-br from-amber-400 to-orange-500 cursor-not-allowed"
                                : isSelected
                                    ? "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                                    : inDrag
                                        ? dragMode === "add"
                                            ? "bg-blue-300 dark:bg-blue-400"
                                            : "bg-red-300 dark:bg-red-400"
                                        : "bg-white dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-pointer"
                        )}
                        title={
                          isStage
                              ? "스테이지"
                              : isSelected
                                  ? `${selectedSeats.get(key)?.seatNumber} (${row}, ${col})`
                                  : `(${row}, ${col})`
                        }
                    />
                );
              })}
            </div>
          </div>
        </div>

        {/* 범례 - 중앙 정렬 */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded" />
            <span>스테이지</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span>선택된 좌석</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded" />
            <span>빈 공간</span>
          </div>
        </div>
      </div>
  );
}