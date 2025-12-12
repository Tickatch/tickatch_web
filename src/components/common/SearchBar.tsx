"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  isScrolled?: boolean;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: "recent" | "popular" | "autocomplete";
}

// 임시 추천 검색어 데이터 (추후 API 연동)
const recentSearches: SearchSuggestion[] = [
  { id: "r1", text: "아이유 콘서트", type: "recent" },
  { id: "r2", text: "뮤지컬 위키드", type: "recent" },
  { id: "r3", text: "BTS", type: "recent" },
];

const popularSearches: SearchSuggestion[] = [
  { id: "p1", text: "김건모 라이브 투어", type: "popular" },
  { id: "p2", text: "태양의 서커스", type: "popular" },
  { id: "p3", text: "오페라의 유령", type: "popular" },
  { id: "p4", text: "라이온킹", type: "popular" },
  { id: "p5", text: "KBO 플레이오프", type: "popular" },
];

export default function SearchBar({ isScrolled = true }: SearchBarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 자동완성 로직 - useMemo로 계산
  const suggestions = useMemo(() => {
    if (query.length === 0) return [];

    const filtered = [...recentSearches, ...popularSearches].filter((item) =>
        item.text.toLowerCase().includes(query.toLowerCase())
    );
    return filtered.map((item) => ({ ...item, type: "autocomplete" as const }));
  }, [query]);

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleSearch = useCallback((searchText: string) => {
    setQuery(searchText);
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchText)}`);
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query.trim());
    }
  };

  const handleRemoveRecent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Remove recent search:", id);
    // TODO: 최근 검색어 삭제 API 연동
  };

  return (
      <div ref={containerRef} className="relative">
        <form onSubmit={handleSubmit} className="relative">
          <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleFocus}
              placeholder="공연명, 아티스트 검색"
              className={cn(
                  "w-40 sm:w-48 lg:w-64 h-9 pl-4 pr-10",
                  "rounded-full",
                  "border border-transparent",
                  "text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-orange-500/30",
                  "transition-all duration-200",
                  isScrolled
                      ? [
                        // 라이트모드
                        "bg-gray-100 text-gray-900 placeholder:text-gray-400",
                        "focus:bg-white focus:border-orange-500",
                        // 다크모드
                        "dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500",
                        "dark:focus:bg-gray-700 dark:focus:border-orange-500"
                      ]
                      : "bg-white/20 text-white placeholder:text-white/60 focus:bg-white/30"
              )}
          />
          <button
              type="submit"
              className={cn(
                  "absolute right-1 top-1/2 -translate-y-1/2",
                  "w-7 h-7 rounded-full",
                  "flex items-center justify-center",
                  "transition-colors duration-200",
                  isScrolled
                      ? "text-gray-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-400"
                      : "text-white/70 hover:text-white"
              )}
          >
            <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </form>

        {/* 검색 드롭다운 */}
        {isOpen && (
            <div
                className={cn(
                    "absolute right-0 top-12 w-80",
                    "bg-white dark:bg-gray-900",
                    "rounded-xl shadow-2xl",
                    "border border-gray-200 dark:border-gray-700",
                    "z-50 overflow-hidden",
                    "animate-in fade-in slide-in-from-top-2 duration-200"
                )}
            >
              {query.length > 0 && suggestions.length > 0 ? (
                  /* 자동완성 결과 */
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                      검색 결과
                    </div>
                    {suggestions.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleSearch(item.text)}
                            className={cn(
                                "w-full px-4 py-2.5 text-left",
                                "flex items-center gap-3",
                                "hover:bg-gray-50 dark:hover:bg-gray-800",
                                "transition-colors"
                            )}
                        >
                          <svg
                              className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                          >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
                    {item.text}
                  </span>
                        </button>
                    ))}
                  </div>
              ) : (
                  /* 기본 상태: 최근 검색어 + 인기 검색어 */
                  <>
                    {/* 최근 검색어 */}
                    <div className="py-2 border-b border-gray-100 dark:border-gray-800">
                      <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    최근 검색어
                  </span>
                        <button className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                          전체 삭제
                        </button>
                      </div>
                      {recentSearches.length > 0 ? (
                          recentSearches.map((item) => (
                              <button
                                  key={item.id}
                                  onClick={() => handleSearch(item.text)}
                                  className={cn(
                                      "w-full px-4 py-2 text-left",
                                      "flex items-center justify-between group",
                                      "hover:bg-gray-50 dark:hover:bg-gray-800",
                                      "transition-colors"
                                  )}
                              >
                                <div className="flex items-center gap-3">
                                  <svg
                                      className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                  >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <span className="text-sm text-gray-700 dark:text-gray-200">
                          {item.text}
                        </span>
                                </div>
                                <span
                                    onClick={(e) => handleRemoveRecent(item.id, e)}
                                    className={cn(
                                        "p-1 rounded opacity-0 group-hover:opacity-100",
                                        "hover:bg-gray-200 dark:hover:bg-gray-700",
                                        "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                                        "transition-all"
                                    )}
                                >
                        <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </span>
                              </button>
                          ))
                      ) : (
                          <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
                            최근 검색어가 없습니다
                          </div>
                      )}
                    </div>

                    {/* 인기 검색어 */}
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                        인기 검색어
                      </div>
                      {popularSearches.map((item, index) => (
                          <button
                              key={item.id}
                              onClick={() => handleSearch(item.text)}
                              className={cn(
                                  "w-full px-4 py-2 text-left",
                                  "flex items-center gap-3",
                                  "hover:bg-gray-50 dark:hover:bg-gray-800",
                                  "transition-colors"
                              )}
                          >
                    <span
                        className={cn(
                            "w-5 text-center text-sm font-bold",
                            index < 3
                                ? "text-orange-500"
                                : "text-gray-400 dark:text-gray-500"
                        )}
                    >
                      {index + 1}
                    </span>
                            <span className="text-sm text-gray-700 dark:text-gray-200">
                      {item.text}
                    </span>
                          </button>
                      ))}
                    </div>
                  </>
              )}
            </div>
        )}
      </div>
  );
}