"use client";

import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
  };
  icon: React.ReactNode;
  color?: "orange" | "blue" | "green" | "purple" | "rose";
}

const colorClasses = {
  orange: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    icon: "text-orange-500",
    change: "text-orange-600 dark:text-orange-400",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    icon: "text-blue-500",
    change: "text-blue-600 dark:text-blue-400",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-900/20",
    icon: "text-green-500",
    change: "text-green-600 dark:text-green-400",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    icon: "text-purple-500",
    change: "text-purple-600 dark:text-purple-400",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-900/20",
    icon: "text-rose-500",
    change: "text-rose-600 dark:text-rose-400",
  },
};

export default function StatCard({
                                   title,
                                   value,
                                   change,
                                   icon,
                                   color = "orange",
                                 }: StatCardProps) {
  const colors = colorClasses[color];

  return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {title}
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {change && (
                <p className="mt-2 text-sm">
              <span
                  className={cn(
                      "font-medium",
                      change.value >= 0 ? "text-green-600" : "text-red-600"
                  )}
              >
                {change.value >= 0 ? "+" : ""}
                {change.value}%
              </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                {change.label}
              </span>
                </p>
            )}
          </div>
          <div className={cn("p-3 rounded-lg", colors.bg)}>
            <div className={colors.icon}>{icon}</div>
          </div>
        </div>
      </div>
  );
}