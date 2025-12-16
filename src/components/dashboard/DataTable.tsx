"use client";

import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
}

export default function DataTable<T>({
                                       columns,
                                       data,
                                       keyField,
                                       onRowClick,
                                       emptyMessage = "데이터가 없습니다.",
                                       isLoading = false,
                                     }: DataTableProps<T>) {
  if (isLoading) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">로딩 중...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              {columns.map((col) => (
                  <th
                      key={col.key}
                      className={cn(
                          "px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider",
                          col.className
                      )}
                  >
                    {col.label}
                  </th>
              ))}
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {data.length === 0 ? (
                <tr>
                  <td
                      colSpan={columns.length}
                      className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {emptyMessage}
                  </td>
                </tr>
            ) : (
                data.map((item) => (
                    <tr
                        key={String(item[keyField])}
                        onClick={() => onRowClick?.(item)}
                        className={cn(
                            "transition-colors",
                            onRowClick &&
                            "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        )}
                    >
                      {columns.map((col) => (
                          <td
                              key={col.key}
                              className={cn(
                                  "px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap",
                                  col.className
                              )}
                          >
                            {col.render
                                ? col.render(item)
                                : String((item as Record<string, unknown>)[col.key] ?? "-")}
                          </td>
                      ))}
                    </tr>
                ))
            )}
            </tbody>
          </table>
        </div>
      </div>
  );
}