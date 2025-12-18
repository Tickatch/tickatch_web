export default function SellerReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">예매 상세</h1>
      <p className="text-gray-500 mt-2">준비 중입니다.</p>
    </div>
  );
}
