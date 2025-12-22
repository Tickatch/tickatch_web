"use client";

import { ReactNode } from "react";
import { QueueProvider } from "@/providers/QueueProvider";

interface ProductDetailLayoutProps {
  children: ReactNode;
}

export default function ProductDetailLayout({ children }: ProductDetailLayoutProps) {
  return <QueueProvider>{children}</QueueProvider>;
}