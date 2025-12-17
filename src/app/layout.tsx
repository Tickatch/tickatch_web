import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "TICKATCH - 최고의 공연 티케팅 서비스",
  description: "콘서트, 뮤지컬, 연극, 스포츠 등 다양한 공연을 티캣치에서 예매하세요.",
  keywords: ["티켓", "공연", "콘서트", "뮤지컬", "연극", "스포츠", "예매"],
  authors: [{ name: "Tickatch" }],
  openGraph: {
    title: "TICKATCH - 최고의 공연 티케팅 서비스",
    description: "콘서트, 뮤지컬, 연극, 스포츠 등 다양한 공연을 티캣치에서 예매하세요.",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
      </body>
      </html>
  );
}