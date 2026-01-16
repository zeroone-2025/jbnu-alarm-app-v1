import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ZeroTime - 전북대 알리미',
  description: 'ZeroTime - 전북대 공지사항 통합 알림 서비스',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ZeroTime',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo-192x192.png" />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-SMF31V39T9" />
        <Script id="ga-init">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-SMF31V39T9');`}
        </Script>
      </head>
      <body className={`${inter.className} flex h-screen flex-col bg-gray-50 text-gray-900`}>
        <Providers>
          <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
