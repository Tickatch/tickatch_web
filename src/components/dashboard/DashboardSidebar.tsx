"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

export interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

interface DashboardSidebarProps {
  groups: SidebarGroup[];
  title: string;
  titleHref: string;
  logoIcon: React.ReactNode;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function DashboardSidebar({
                                           groups,
                                           title,
                                           titleHref,
                                           logoIcon,
                                           collapsed = false,
                                           onCollapsedChange,
                                         }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapsedChange?.(newState);
  };

  return (
      <aside
          className={cn(
              "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300",
              isCollapsed ? "w-16" : "w-64"
          )}
      >
        {/* 로고 & 토글 */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <Link
              href={titleHref}
              className={cn(
                  "flex items-center gap-2 font-bold text-gray-900 dark:text-white",
                  isCollapsed && "justify-center"
              )}
          >
            {logoIcon}
            {!isCollapsed && <span>{title}</span>}
          </Link>
          <button
              onClick={handleToggle}
              className={cn(
                  "p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500",
                  isCollapsed && "absolute right-2"
              )}
          >
            <svg
                className={cn("w-5 h-5 transition-transform", isCollapsed && "rotate-180")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* 네비게이션 */}
        <nav className="p-3 space-y-6 overflow-y-auto h-[calc(100vh-64px)]">
          {groups.map((group) => (
              <div key={group.title}>
                {!isCollapsed && (
                    <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {group.title}
                    </h3>
                )}
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    // const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const isActive = pathname === item.href;
                    return (
                        <li key={item.href}>
                          <Link
                              href={item.href}
                              className={cn(
                                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                  isActive
                                      ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
                                  isCollapsed && "justify-center px-2"
                              )}
                              title={isCollapsed ? item.label : undefined}
                          >
                            <span className="flex-shrink-0">{item.icon}</span>
                            {!isCollapsed && (
                                <>
                                  <span className="flex-1">{item.label}</span>
                                  {item.badge !== undefined && item.badge > 0 && (
                                      <span className="px-2 py-0.5 text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                              {item.badge}
                            </span>
                                  )}
                                </>
                            )}
                          </Link>
                        </li>
                    );
                  })}
                </ul>
              </div>
          ))}
        </nav>
      </aside>
  );
}