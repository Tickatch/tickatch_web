"use client";

import { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import { cn } from "@/lib/utils";

interface NoticeItem {
  id: number;
  title: string;
  content: string;
  category: "NOTICE" | "UPDATE" | "EVENT";
  isPinned: boolean;
  createdAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  NOTICE: "공지",
  UPDATE: "업데이트",
  EVENT: "이벤트",
};

const CATEGORY_COLORS: Record<string, string> = {
  NOTICE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  UPDATE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  EVENT: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

// 더미 데이터
const DUMMY_NOTICES: NoticeItem[] = [
  {
    id: 1,
    title: "[공지] 2025년 연말연시 고객센터 운영 안내",
    content: "안녕하세요, TICKATCH입니다.\n\n2025년 연말연시 기간 고객센터 운영 안내드립니다.\n\n■ 휴무 기간: 2025년 12월 25일(수) ~ 2026년 1월 1일(수)\n■ 정상 운영: 2026년 1월 2일(목)부터\n\n휴무 기간 중 문의사항은 1:1 문의를 이용해 주시기 바랍니다.\n감사합니다.",
    category: "NOTICE",
    isPinned: true,
    createdAt: "2025-12-15T10:00:00",
  },
  {
    id: 2,
    title: "[업데이트] 앱 버전 3.0.0 업데이트 안내",
    content: "TICKATCH 앱이 버전 3.0.0으로 업데이트되었습니다.\n\n■ 주요 업데이트 내용\n- 좌석 선택 UI 전면 개편\n- 실시간 좌석 현황 표시\n- 결제 안정성 향상\n- 다크모드 지원\n- 버그 수정\n\n더 나은 서비스를 위해 최신 버전으로 업데이트해 주세요.",
    category: "UPDATE",
    isPinned: true,
    createdAt: "2025-12-10T14:00:00",
  },
  {
    id: 3,
    title: "[공지] 12월 정기 점검 안내",
    content: "서비스 안정화를 위한 정기 점검이 진행됩니다.\n\n■ 점검 일시: 2025년 12월 20일(금) 02:00 ~ 06:00 (4시간)\n■ 점검 내용: 서버 점검 및 보안 업데이트\n\n점검 시간 동안 서비스 이용이 제한됩니다.\n이용에 불편을 드려 죄송합니다.",
    category: "NOTICE",
    isPinned: false,
    createdAt: "2025-12-05T09:00:00",
  },
  {
    id: 4,
    title: "[이벤트] 연말 특별 할인 이벤트 안내",
    content: "연말을 맞아 특별 할인 이벤트를 진행합니다!\n\n■ 이벤트 기간: 2025년 12월 15일 ~ 12월 31일\n■ 할인 내용: 전 공연 예매 시 10% 할인\n■ 쿠폰 코드: YEAR2025\n\n자세한 내용은 이벤트 페이지를 확인해 주세요.",
    category: "EVENT",
    isPinned: false,
    createdAt: "2025-12-01T10:00:00",
  },
  {
    id: 5,
    title: "[공지] 개인정보처리방침 변경 안내",
    content: "개인정보처리방침이 일부 변경됨을 안내드립니다.\n\n■ 변경 시행일: 2026년 1월 1일\n■ 주요 변경 사항:\n- 개인정보 보유 기간 명확화\n- 제3자 제공 동의 절차 개선\n\n자세한 내용은 개인정보처리방침 페이지를 확인해 주세요.",
    category: "NOTICE",
    isPinned: false,
    createdAt: "2025-11-20T09:00:00",
  },
];

export default function NoticePage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        // TODO: 실제 API 연동
        await new Promise((resolve) => setTimeout(resolve, 500));
        setNotices(DUMMY_NOTICES);
      } catch (error) {
        console.error("Notices fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header userType="CUSTOMER" bannerHeight={0} />

        <div className="pt-16">
          <div className="max-w-[900px] mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              공지사항
            </h1>

            {isLoading ? (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
            ) : notices.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    등록된 공지사항이 없습니다.
                  </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  {notices.map((notice, index) => (
                      <div
                          key={notice.id}
                          className={cn(
                              "border-b border-gray-200 dark:border-gray-800 last:border-b-0",
                              notice.isPinned && "bg-orange-50 dark:bg-orange-900/10"
                          )}
                      >
                        <button
                            onClick={() => toggleExpand(notice.id)}
                            className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          {notice.isPinned && (
                              <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                              </svg>
                          )}
                          <span
                              className={cn(
                                  "px-2 py-0.5 rounded text-xs font-medium flex-shrink-0",
                                  CATEGORY_COLORS[notice.category]
                              )}
                          >
                      {CATEGORY_LABELS[notice.category]}
                    </span>
                          <span className="flex-1 font-medium text-gray-900 dark:text-white truncate">
                      {notice.title}
                    </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {formatDate(notice.createdAt)}
                    </span>
                          <svg
                              className={cn(
                                  "w-5 h-5 text-gray-400 transition-transform",
                                  expandedId === notice.id && "rotate-180"
                              )}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {expandedId === notice.id && (
                            <div className="px-6 pb-6">
                              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300">
                          {notice.content}
                        </pre>
                              </div>
                            </div>
                        )}
                      </div>
                  ))}
                </div>
            )}
          </div>
        </div>
      </div>
  );
}