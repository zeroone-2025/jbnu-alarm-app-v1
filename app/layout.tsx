import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZeroTime - 전북대 알리미",
  description: "ZeroTime - 전북대 공지사항 통합 알림 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} flex h-screen flex-col bg-gray-50 text-gray-900`}>
        <Providers>
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
