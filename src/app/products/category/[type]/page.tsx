import { redirect } from "next/navigation";

interface CategoryPageProps {
  params: Promise<{ type: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { type } = await params;

  // /category/[type] → /products?type=[type] 리다이렉트
  redirect(`/products?type=${type.toUpperCase()}`);
}