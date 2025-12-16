"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArtHallStatus, ART_HALL_STATUS_LABELS } from "@/types/venue";

interface FormData {
  name: string;
  address: string;
  status: ArtHallStatus;
}

export default function NewArtHallPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    address: "",
    status: "ACTIVE",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("공연장명을 입력해주세요.");
      return;
    }
    if (!formData.address.trim()) {
      alert("주소를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: 실제 API 호출
      const response = await fetch("/api/arthalls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("등록에 실패했습니다.");
      }

      alert("공연장이 등록되었습니다.");
      router.push("/admin/arthalls");
    } catch (error) {
      alert("공연장 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="max-w-2xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            공연장 등록
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            새로운 공연장을 등록합니다.
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                공연장명 *
              </label>
              <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 올림픽공원 KSPO DOME"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                주소 *
              </label>
              <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="예: 서울특별시 송파구 올림픽로 424"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                상태
              </label>
              <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ArtHallStatus })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(ART_HALL_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 공연장 등록 후 스테이지와 좌석을 추가로 등록할 수 있습니다.
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