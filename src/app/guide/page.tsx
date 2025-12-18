"use client";

import { useState } from "react";
import Header from "@/components/common/Header";
import { cn } from "@/lib/utils";

interface GuideSection {
  id: string;
  title: string;
  content: string;
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "reservation",
    title: "예매 방법",
    content: `1. 원하는 공연을 선택합니다.
2. 공연 상세 페이지에서 '예매하기' 버튼을 클릭합니다.
3. 좌석을 선택합니다. (1인당 최대 4매까지 예매 가능)
4. 결제 정보를 입력하고 결제를 완료합니다.
5. 예매 완료 후 마이페이지에서 예매 내역을 확인할 수 있습니다.

※ 예매 시 회원 로그인이 필요합니다.
※ 일부 공연은 본인확인이 필요할 수 있습니다.`,
  },
  {
    id: "cancel",
    title: "취소/환불 안내",
    content: `■ 취소 수수료
- 예매 후 7일 이내: 무료 취소
- 공연 7일 전까지: 티켓 금액의 10%
- 공연 3일 전까지: 티켓 금액의 20%
- 공연 1일 전까지: 티켓 금액의 30%
- 공연 당일: 취소 불가

■ 환불 방법
- 결제 수단에 따라 3~7영업일 내 환불 처리됩니다.
- 카드 결제: 카드사에 따라 영업일 기준 3~5일 소요
- 계좌이체: 영업일 기준 3~7일 소요

※ 공연에 따라 취소 정책이 다를 수 있습니다.
※ 자세한 내용은 각 공연 상세 페이지를 확인해 주세요.`,
  },
  {
    id: "ticket",
    title: "티켓 수령/입장 안내",
    content: `■ 모바일 티켓
- 예매 완료 후 마이페이지에서 모바일 티켓 확인 가능
- 공연 당일 입장 시 모바일 티켓의 QR코드를 제시해 주세요.

■ 현장 수령
- 공연장 현장에서 신분증을 제시하고 티켓을 수령합니다.
- 공연 시작 1시간 전부터 수령 가능

■ 입장 안내
- 공연 시작 30분 전부터 입장 가능합니다.
- 공연에 따라 늦은 입장이 제한될 수 있습니다.
- 공연 중 촬영 및 녹음은 금지되어 있습니다.`,
  },
  {
    id: "member",
    title: "회원 등급/혜택",
    content: `■ 회원 등급
- 일반: 가입 시 기본 등급
- VIP: 연간 예매 금액 50만원 이상
- VVIP: 연간 예매 금액 100만원 이상

■ 등급별 혜택
- 일반: 기본 적립 1%
- VIP: 적립 2%, 우선 예매권 제공
- VVIP: 적립 3%, 우선 예매권, 전용 고객센터

※ 등급은 매년 1월 1일 갱신됩니다.`,
  },
  {
    id: "contact",
    title: "고객센터 안내",
    content: `■ 운영 시간
- 평일: 09:00 ~ 18:00
- 토요일: 10:00 ~ 14:00
- 일요일/공휴일: 휴무

■ 연락처
- 전화: 1588-0000
- 이메일: help@tickatch.com

■ 1:1 문의
- 로그인 후 마이페이지에서 1:1 문의 가능
- 평균 응답 시간: 24시간 이내`,
  },
];

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState<string>("reservation");

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header userType="CUSTOMER" bannerHeight={0} />

        <div className="pt-16">
          <div className="max-w-[1000px] mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              이용안내
            </h1>

            <div className="flex flex-col md:flex-row gap-6">
              {/* 사이드 네비게이션 */}
              <aside className="md:w-48 flex-shrink-0">
                <nav className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden sticky top-20">
                  {GUIDE_SECTIONS.map((section) => (
                      <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={cn(
                              "w-full px-4 py-3 text-left text-sm font-medium transition-colors",
                              "border-b border-gray-100 dark:border-gray-800 last:border-b-0",
                              activeSection === section.id
                                  ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          )}
                      >
                        {section.title}
                      </button>
                  ))}
                </nav>
              </aside>

              {/* 컨텐츠 */}
              <main className="flex-1">
                {GUIDE_SECTIONS.map((section) => (
                    <div
                        key={section.id}
                        className={cn(
                            "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden",
                            activeSection === section.id ? "block" : "hidden"
                        )}
                    >
                      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                          {section.title}
                        </h2>
                      </div>

                      <div className="p-6">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed">
                      {section.content}
                    </pre>
                      </div>
                    </div>
                ))}
              </main>
            </div>
          </div>
        </div>
      </div>
  );
}