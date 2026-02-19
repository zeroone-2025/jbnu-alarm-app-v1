'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ToastProvider } from '@/_context/ToastContext';
import DesktopSidebar from '@/_components/layout/DesktopSidebar';
import MobileSidebar from '@/_components/layout/MobileSidebar';
import SharedHeader from '@/_components/layout/SharedHeader';

const MAIN_PAGES = new Set(['/', '/profile', '/chinba']);

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  const showHeader = MAIN_PAGES.has(normalizedPath);

  return (
    <ToastProvider>
      <div className="h-full w-full overflow-hidden bg-gray-50">
        {/* 사이드바 + 콘텐츠를 하나의 박스로 묶어 가운데 정렬 */}
        <div className="mx-auto flex h-full w-full max-w-md md:max-w-[calc(280px+56rem)] md:shadow-xl">
          {/* Desktop: persistent sidebar */}
          <DesktopSidebar />

          {/* Main content */}
          <div className="relative flex h-full w-full min-w-0 flex-1 flex-col border-x border-gray-100 bg-white shadow-xl md:border-l-0 md:shadow-none">
            {showHeader && (
              <div className="shrink-0" style={{ touchAction: 'none' }}>
                <SharedHeader
                  title="logo"
                  onMenuClick={() => setMobileSidebarOpen(true)}
                />
              </div>
            )}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              {children}
            </div>
          </div>
        </div>

        {/* Mobile: overlay sidebar */}
        <MobileSidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
      </div>
    </ToastProvider>
  );
}
