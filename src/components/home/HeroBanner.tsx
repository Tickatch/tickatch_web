"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { BannerItem, PRODUCT_TYPE_LABELS } from "@/types/product";
import { cn } from "@/lib/utils";

interface HeroBannerProps {
  items: BannerItem[];
  autoPlayInterval?: number;
}

export default function HeroBanner({
                                     items,
                                     autoPlayInterval = 5000,
                                   }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isPosterVisible, setIsPosterVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalItems = items.length;

  const goToNext = useCallback(() => {
    if (totalItems === 0) return;
    setCurrentIndex((prev) => (prev + 1) % totalItems);
    setProgress(0);
  }, [totalItems]);

  const goToPrev = useCallback(() => {
    if (totalItems === 0) return;
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
    setProgress(0);
  }, [totalItems]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  // 자동 슬라이드 및 프로그레스 바
  useEffect(() => {
    if (isHovered || totalItems === 0) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 100 / (autoPlayInterval / 50);
      });
    }, 50);

    const slideInterval = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => {
      clearInterval(progressInterval);
      clearInterval(slideInterval);
    };
  }, [isHovered, autoPlayInterval, goToNext, totalItems]);

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  // 빈 배너 처리
  if (totalItems === 0) {
    return (
        <section className="relative w-full bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="max-w-[1400px] mx-auto">
            <div className="relative aspect-[16/7] lg:aspect-[21/9] flex items-center justify-center">
              <div className="text-center text-gray-400">
                <svg
                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
                <p className="text-lg">진행 중인 공연이 없습니다</p>
              </div>
            </div>
          </div>
        </section>
    );
  }

  const currentItem = items[currentIndex];

  return (
      <section
          className="relative w-full bg-black overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setIsPosterVisible(false);
          }}
      >
        <div className="max-w-[1400px] mx-auto relative">
          {/* 배너 컨테이너 */}
          <div className="relative aspect-[16/7] lg:aspect-[21/9]">
            {/* 메인 이미지 레이어 */}
            {items.map((item, index) => (
                <Link
                    key={item.id}
                    href={item.link}
                    className={cn(
                        "absolute inset-0 transition-opacity duration-700",
                        index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                    )}
                >
                  {/* 메인 이미지 */}
                  {item.mainImage ? (
                      <Image
                          src={item.mainImage}
                          alt={item.title}
                          fill
                          className="object-cover"
                          priority={index === 0}
                      />
                  ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
                  )}

                  {/* 그라데이션 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                  {/* 텍스트 정보 */}
                  <div
                      className={cn(
                          "absolute left-6 lg:left-16 bottom-20 lg:bottom-24",
                          "max-w-lg transition-all duration-500 delay-200",
                          index === currentIndex
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 translate-y-4"
                      )}
                  >
                    {/* 상품 타입 배지 */}
                    <span
                        className={cn(
                            "inline-block px-3 py-1 mb-3",
                            "text-xs font-semibold uppercase tracking-wider",
                            "bg-orange-500 text-white rounded"
                        )}
                    >
                  {PRODUCT_TYPE_LABELS[item.productType]}
                </span>

                    {/* 기간 */}
                    {item.period && (
                        <p className="text-orange-400 text-sm lg:text-base font-medium mb-2">
                          {item.period}
                        </p>
                    )}

                    {/* 타이틀 */}
                    <h2 className="text-white text-2xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-2">
                      {item.title.split("\n").map((line, i) => (
                          <span key={i} className="block">
                      {line}
                    </span>
                      ))}
                    </h2>

                    {/* 서브타이틀 (장소) */}
                    {item.subtitle && (
                        <p className="text-gray-300 text-sm lg:text-base flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {item.subtitle}
                        </p>
                    )}
                  </div>
                </Link>
            ))}

            {/* 포스터 이미지 (호버 시 표시) - 데스크탑만 */}
            <div
                className={cn(
                    "hidden lg:block",
                    "absolute right-16 top-1/2 -translate-y-1/2 z-20",
                    "w-48 xl:w-56 aspect-[3/4]",
                    "transition-all duration-500",
                    isPosterVisible
                        ? "opacity-100 translate-x-0 scale-100"
                        : "opacity-0 translate-x-8 scale-95"
                )}
            >
              <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10">
                {currentItem?.posterImage ? (
                    <Image
                        src={currentItem.posterImage}
                        alt={`${currentItem.title} 포스터`}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                )}
              </div>
            </div>

            {/* 포스터 트리거 영역 (데스크탑에서만) */}
            <div
                className="hidden lg:block absolute right-0 top-0 bottom-0 w-1/3 z-15"
                onMouseEnter={() => setIsPosterVisible(true)}
                onMouseLeave={() => setIsPosterVisible(false)}
            />

            {/* 좌우 화살표 */}
            <button
                onClick={(e) => {
                  e.preventDefault();
                  goToPrev();
                }}
                className={cn(
                    "absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 z-30",
                    "w-10 h-10 lg:w-12 lg:h-12 rounded-full",
                    "bg-black/30 backdrop-blur-sm",
                    "border border-white/20",
                    "flex items-center justify-center",
                    "text-white/70 hover:text-white",
                    "hover:bg-black/50 hover:border-white/40",
                    "transition-all duration-300",
                    isHovered ? "opacity-100" : "opacity-0 lg:opacity-0"
                )}
                aria-label="이전 슬라이드"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
                onClick={(e) => {
                  e.preventDefault();
                  goToNext();
                }}
                className={cn(
                    "absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 z-30",
                    "w-10 h-10 lg:w-12 lg:h-12 rounded-full",
                    "bg-black/30 backdrop-blur-sm",
                    "border border-white/20",
                    "flex items-center justify-center",
                    "text-white/70 hover:text-white",
                    "hover:bg-black/50 hover:border-white/40",
                    "transition-all duration-300",
                    isHovered ? "opacity-100" : "opacity-0 lg:opacity-0"
                )}
                aria-label="다음 슬라이드"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* 하단 페이지네이션 */}
            <div className="absolute bottom-4 lg:bottom-6 left-1/2 -translate-x-1/2 z-30">
              <div
                  className={cn(
                      "flex flex-col items-center gap-2",
                      "px-4 py-2 rounded-full",
                      "bg-black/40 backdrop-blur-sm"
                  )}
              >
                {/* 페이지 번호 */}
                <div className="flex items-center gap-1 text-sm font-medium">
                  <span className="text-white">{currentIndex + 1}</span>
                  <span className="text-white/50">/</span>
                  <span className="text-white/50">{totalItems}</span>
                </div>

                {/* 프로그레스 바 */}
                <div className="w-20 h-0.5 bg-white/30 rounded-full overflow-hidden">
                  <div
                      className="h-full bg-orange-500 transition-all duration-100"
                      style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 도트 인디케이터 (모바일) */}
            <div className="flex lg:hidden absolute bottom-16 left-1/2 -translate-x-1/2 z-30 gap-2">
              {items.map((_, index) => (
                  <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={cn(
                          "w-2 h-2 rounded-full transition-all duration-300",
                          index === currentIndex
                              ? "w-6 bg-orange-500"
                              : "bg-white/50 hover:bg-white/80"
                      )}
                      aria-label={`슬라이드 ${index + 1}로 이동`}
                  />
              ))}
            </div>
          </div>
        </div>
      </section>
  );
}