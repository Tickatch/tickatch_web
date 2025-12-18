"use client";

import { useState, useEffect } from "react";
import { ProductResponse, PRODUCT_STATUS_LABELS, getStatusColor } from "@/types/product";
import { cn } from "@/lib/utils";

interface SettlementSummary {
  totalRevenue: number;      // 총 매출
  pendingAmount: number;     // 정산 대기 금액
  settledAmount: number;     // 정산 완료 금액
  fee: number;               // 수수료
}

interface ProductSales {
  product: ProductResponse;
  soldSeats: number;
  revenue: number;
}

export default function SellerSettlementPage() {
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [summary, setSummary] = useState<SettlementSummary>({
    totalRevenue: 0,
    pendingAmount: 0,
    settledAmount: 0,
    fee: 0,
  });
  const [productSales, setProductSales] = useState<ProductSales[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);

  // 정산 정보
  const [settlementInfo, setSettlementInfo] = useState({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
  });
  const [isEditingInfo, setIsEditingInfo] = useState(false);

  // 판매자 정보 가져오기
  useEffect(() => {
    const fetchSellerInfo = async () => {
      try {
        const response = await fetch("/api/user/sellers/me");
        if (response.ok) {
          const data = await response.json();
          const seller = data.data || data;
          setSellerId(seller.id);
          setSettlementInfo({
            bankName: seller.bankName || "",
            accountNumber: seller.accountNumber || "",
            accountHolder: seller.accountHolder || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch seller info:", error);
      }
    };
    fetchSellerInfo();
  }, []);

  // 매출 데이터 가져오기
  useEffect(() => {
    if (!sellerId) return;

    const fetchSalesData = async () => {
      setIsLoading(true);
      try {
        // 내 상품 목록 조회
        const response = await fetch(`/api/products?sellerId=${sellerId}&size=100`);

        if (response.ok) {
          const data = await response.json();
          const products: ProductResponse[] = data.data?.content || data.content || [];

          // 매출 계산
          let totalRevenue = 0;
          const sales: ProductSales[] = [];

          for (const product of products) {
            const soldSeats = product.totalSeats - product.availableSeats;
            if (soldSeats > 0) {
              // 평균 가격으로 매출 계산 (실제로는 예매 API에서 가져와야 함)
              let avgPrice = 0;
              if (product.seatGrades && product.seatGrades.length > 0) {
                avgPrice = product.seatGrades.reduce((sum, g) => sum + g.price, 0) / product.seatGrades.length;
              }
              const revenue = soldSeats * avgPrice;
              totalRevenue += revenue;

              sales.push({
                product,
                soldSeats,
                revenue,
              });
            }
          }

          // 수수료 5%
          const fee = totalRevenue * 0.05;

          setSummary({
            totalRevenue,
            pendingAmount: totalRevenue - fee,  // 정산 대기 (수수료 제외)
            settledAmount: 0,                    // TODO: 실제 정산 완료 금액
            fee,
          });

          setProductSales(sales.sort((a, b) => b.revenue - a.revenue));
        }
      } catch (error) {
        console.error("Failed to fetch sales data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, [sellerId]);

  // 정산 정보 저장
  const handleSaveSettlementInfo = async () => {
    if (!sellerId) return;
    if (!settlementInfo.bankName || !settlementInfo.accountNumber || !settlementInfo.accountHolder) {
      alert("정산 정보를 모두 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`/api/user/sellers/${sellerId}/settlement`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settlementInfo),
      });

      if (!response.ok) {
        throw new Error("정산 정보 저장에 실패했습니다.");
      }

      setIsEditingInfo(false);
      alert("정산 정보가 저장되었습니다.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "저장에 실패했습니다.");
    }
  };

  // 정산 요청
  const handleRequestSettlement = async () => {
    if (!settlementInfo.bankName || !settlementInfo.accountNumber) {
      alert("정산 정보를 먼저 등록해주세요.");
      return;
    }

    if (summary.pendingAmount <= 0) {
      alert("정산 요청할 금액이 없습니다.");
      return;
    }

    setIsRequesting(true);
    try {
      // TODO: POST /api/settlements/request 구현 필요
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("정산 요청이 완료되었습니다.\n관리자 검토 후 입금됩니다.");
    } catch (error) {
      alert("정산 요청에 실패했습니다.");
    } finally {
      setIsRequesting(false);
    }
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            정산 관리
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            매출 현황을 확인하고 정산을 요청하세요.
          </p>
        </div>

        {/* 매출 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">총 매출</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {summary.totalRevenue.toLocaleString()}원
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">수수료 (5%)</p>
            <p className="text-2xl font-bold text-red-500 mt-2">
              -{summary.fee.toLocaleString()}원
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-emerald-200 dark:border-emerald-800 p-6">
            <p className="text-sm text-emerald-600 dark:text-emerald-400">정산 대기 금액</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              {summary.pendingAmount.toLocaleString()}원
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">정산 완료</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {summary.settledAmount.toLocaleString()}원
            </p>
          </div>
        </div>

        {/* 정산 정보 & 요청 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 정산 계좌 정보 */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                정산 계좌 정보
              </h2>
              {!isEditingInfo && (
                  <button
                      onClick={() => setIsEditingInfo(true)}
                      className="text-sm text-emerald-500 hover:text-emerald-600"
                  >
                    수정
                  </button>
              )}
            </div>

            {isEditingInfo ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      은행명
                    </label>
                    <input
                        type="text"
                        value={settlementInfo.bankName}
                        onChange={(e) => setSettlementInfo({ ...settlementInfo, bankName: e.target.value })}
                        placeholder="예: 국민은행"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      계좌번호
                    </label>
                    <input
                        type="text"
                        value={settlementInfo.accountNumber}
                        onChange={(e) => setSettlementInfo({ ...settlementInfo, accountNumber: e.target.value })}
                        placeholder="예: 123-456-789012"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      예금주
                    </label>
                    <input
                        type="text"
                        value={settlementInfo.accountHolder}
                        onChange={(e) => setSettlementInfo({ ...settlementInfo, accountHolder: e.target.value })}
                        placeholder="예: 홍길동"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                        onClick={() => setIsEditingInfo(false)}
                        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      취소
                    </button>
                    <button
                        onClick={handleSaveSettlementInfo}
                        className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                    >
                      저장
                    </button>
                  </div>
                </div>
            ) : (
                <div className="space-y-3">
                  {settlementInfo.bankName ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-500">은행</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                      {settlementInfo.bankName}
                    </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">계좌번호</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                      {settlementInfo.accountNumber}
                    </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">예금주</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                      {settlementInfo.accountHolder}
                    </span>
                        </div>
                      </>
                  ) : (
                      <p className="text-gray-500 text-center py-4">
                        정산받을 계좌 정보를 등록해주세요.
                      </p>
                  )}
                </div>
            )}
          </div>

          {/* 정산 요청 */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
            <h2 className="text-lg font-semibold mb-4">정산 요청</h2>

            <div className="bg-white/10 rounded-lg p-4 mb-6">
              <p className="text-sm text-white/80">정산 가능 금액</p>
              <p className="text-3xl font-bold mt-1">
                {summary.pendingAmount.toLocaleString()}원
              </p>
            </div>

            <button
                onClick={handleRequestSettlement}
                disabled={isRequesting || summary.pendingAmount <= 0 || !settlementInfo.bankName}
                className={cn(
                    "w-full py-3 rounded-lg font-semibold transition-colors",
                    summary.pendingAmount > 0 && settlementInfo.bankName
                        ? "bg-white text-emerald-600 hover:bg-gray-100"
                        : "bg-white/30 text-white/60 cursor-not-allowed"
                )}
            >
              {isRequesting ? "요청 중..." : "정산 요청하기"}
            </button>

            <p className="text-xs text-white/60 mt-4 text-center">
              * 정산은 요청 후 영업일 기준 3~5일 이내 처리됩니다.
            </p>
          </div>
        </div>

        {/* 상품별 매출 */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            상품별 매출
          </h2>

          {productSales.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                아직 매출이 발생한 상품이 없습니다.
              </p>
          ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                  <tr className="text-left text-sm text-gray-500 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 font-medium">상품명</th>
                    <th className="pb-3 font-medium">상태</th>
                    <th className="pb-3 font-medium text-right">판매 좌석</th>
                    <th className="pb-3 font-medium text-right">매출</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {productSales.map((sale) => (
                      <tr key={sale.product.id}>
                        <td className="py-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {sale.product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {sale.product.artHallName}
                          </div>
                        </td>
                        <td className="py-4">
                      <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          getStatusColor(sale.product.status)
                      )}>
                        {PRODUCT_STATUS_LABELS[sale.product.status]}
                      </span>
                        </td>
                        <td className="py-4 text-right text-gray-900 dark:text-white">
                          {sale.soldSeats}석
                        </td>
                        <td className="py-4 text-right font-medium text-gray-900 dark:text-white">
                          {sale.revenue.toLocaleString()}원
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
          )}
        </div>
      </div>
  );
}