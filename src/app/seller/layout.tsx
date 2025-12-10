import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TICKATCH Seller - 판매자 센터",
  description: "티케팅 판매자 센터",
};

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
