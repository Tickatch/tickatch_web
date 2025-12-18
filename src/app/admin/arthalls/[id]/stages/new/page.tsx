"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StageStatus, STAGE_STATUS_LABELS } from "@/types/venue";

interface Props {
  params: Promise<{ id: string }>;
}

export default function NewStagePage({ params }: Props) {
  const { id: artHallId } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<StageStatus>("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("스테이지명을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/arthalls/${artHallId}/stages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "등록에 실패했습니다.");
      }

      alert("스테이지가 등록되었습니다. 이제 좌석을 배치해주세요.");

      // 새로 생성된 스테이지의 좌석 관리 페이지로 이동
      const stageId = data.data?.stageId || data.stageId;
      if (stageId) {
        router.push(`/admin/arthalls/${artHallId}/stages/${stageId}`);
      } else {
        router.push(`/admin/arthalls/${artHallId}`);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "스테이지 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="max-w-2xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <Link
              href={`/admin/arthalls/${artHallId}`}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-2 inline-block"
          >
            ← 공연장 상세
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            스테이지 등록
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            새로운 스테이지를 등록합니다.
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
            {/* 스테이지명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                스테이지명 <span className="text-red-500">*</span>
              </label>
              <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 메인홀, 소극장 A"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 상태 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                상태
              </label>
              <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StageStatus)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(STAGE_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                ))}
              </select>
            </div>

            {/* 안내 */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 스테이지 등록 후 좌석 배치 화면으로 이동합니다.
              </p>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              취소
            </button>
            <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "등록 중..." : "등록하기"}
            </button>
          </div>
        </form>
      </div>
  );
}