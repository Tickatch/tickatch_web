"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { ArtHallStatus, ART_HALL_STATUS_LABELS } from "@/types/venue";

// 다음 주소 API 타입 선언
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

interface FormData {
  name: string;
  zonecode: string;
  address: string;
  addressDetail: string;
  status: ArtHallStatus;
}

export default function NewArtHallPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    zonecode: "",
    address: "",
    addressDetail: "",
    status: "ACTIVE",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 다음 주소 검색 모달 열기
  const openAddressSearch = () => {
    if (!window.daum) {
      alert("주소 검색 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data: DaumPostcodeResult) => {
        const fullAddress = data.roadAddress || data.jibunAddress;
        setFormData((prev) => ({
          ...prev,
          zonecode: data.zonecode,
          address: fullAddress,
        }));
      },
    }).open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("공연장명을 입력해주세요.");
      return;
    }
    if (!formData.address.trim()) {
      alert("주소를 검색해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 주소 합치기: 기본주소 + 상세주소
      const fullAddress = formData.addressDetail.trim()
          ? `${formData.address} ${formData.addressDetail.trim()}`
          : formData.address;

      const response = await fetch("/api/arthalls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          address: fullAddress,
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "등록에 실패했습니다.");
      }

      alert("공연장이 등록되었습니다.");
      router.push("/admin/arthalls");
    } catch (error) {
      alert(error instanceof Error ? error.message : "공연장 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <>
        {/* 다음 주소 API 스크립트 */}
        <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" />

        <div className="max-w-2xl mx-auto">
          {/* 페이지 헤더 */}
          <div className="mb-8">
            <Link
                href="/admin/arthalls"
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-2 inline-block"
            >
              ← 공연장 목록
            </Link>
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
              {/* 공연장명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  공연장명 <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="예: 올림픽공원 KSPO DOME"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 주소 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  주소 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {/* 우편번호 + 검색 버튼 */}
                  <div className="flex gap-2">
                    <input
                        type="text"
                        value={formData.zonecode}
                        placeholder="우편번호"
                        readOnly
                        className="w-32 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500"
                    />
                    <button
                        type="button"
                        onClick={openAddressSearch}
                        className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      주소 검색
                    </button>
                  </div>

                  {/* 기본 주소 */}
                  <input
                      type="text"
                      value={formData.address}
                      placeholder="주소를 검색해주세요"
                      readOnly
                      className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500"
                  />

                  {/* 상세 주소 */}
                  <input
                      type="text"
                      value={formData.addressDetail}
                      onChange={(e) => setFormData({ ...formData, addressDetail: e.target.value })}
                      placeholder="상세 주소 (선택)"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 상태 */}
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

              {/* 안내 */}
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
      </>
  );
}