"use client";

import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  isScrolled?: boolean;
}

export default function ThemeToggle({ isScrolled = true }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
      <button
          onClick={toggleTheme}
          className={cn(
              "relative w-10 h-10 rounded-lg flex items-center justify-center",
              "transition-colors duration-200",
              isScrolled
                  ? [
                    // 라이트모드
                    "bg-gray-100 hover:bg-gray-200",
                    // 다크모드
                    "dark:bg-gray-800 dark:hover:bg-gray-700"
                  ]
                  : "bg-white/10 hover:bg-white/20"
          )}
          aria-label={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
      >
        {/* 태양 아이콘 (라이트 모드) */}
        <svg
            className={cn(
                "w-5 h-5 absolute transition-all duration-300",
                theme === "light" ? "opacity-100 rotate-0" : "opacity-0 rotate-90",
                isScrolled ? "text-amber-500" : "text-yellow-300"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
          <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>

        {/* 달 아이콘 (다크 모드) */}
        <svg
            className={cn(
                "w-5 h-5 absolute transition-all duration-300",
                theme === "dark" ? "opacity-100 rotate-0" : "opacity-0 -rotate-90",
                isScrolled ? "text-blue-400" : "text-blue-300"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
          <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </button>
  );
}