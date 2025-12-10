import Header from "@/components/common/Header";

export default function SellerPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="SELLER" />

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            판매자 센터
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            판매자 대시보드 메인 페이지
          </p>
        </div>
      </main>
    </div>
  );
}
