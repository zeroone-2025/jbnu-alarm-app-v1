'use client';

import { useState, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ToastProvider } from '@/_context/ToastContext';
import { NotificationBadgeProvider } from '@/_context/NotificationBadgeContext';
import DesktopSidebar from '@/_components/layout/DesktopSidebar';
import MobileSidebar from '@/_components/layout/MobileSidebar';
import SharedHeader from '@/_components/layout/SharedHeader';

const MAIN_PAGES = new Set(['/', '/profile', '/chinba']);

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // SSR과 클라이언트 초기값을 false(펼침)로 일치시켜 hydration mismatch 방지.
  // useLayoutEffect로 페인트 전에 localStorage 값을 반영하여 깜빡임 없이 보정.
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  useLayoutEffect(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved !== null) {
      setDesktopCollapsed(saved === 'true');
    } else if (window.innerWidth < 1200) {
      setDesktopCollapsed(true);
    }
  }, []);

  const handleDesktopToggle = () => {
    setDesktopCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      if (next) {
        document.documentElement.classList.add('sidebar-collapsed');
      } else {
        document.documentElement.classList.remove('sidebar-collapsed');
      }
      return next;
    });
  };

  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  const CHINBA_HEADER_PATHS = new Set(['/chinba', '/chinba/team', '/chinba/my']);
  const showHeader = MAIN_PAGES.has(normalizedPath) || CHINBA_HEADER_PATHS.has(normalizedPath);

  const collapsed = desktopCollapsed;
  // sidebar(60 or 260) + content — iPad Pro 12.9" 가로(1366px)까지 꽉 채움
  const desktopMaxWidth = 1366;

  return (
    <ToastProvider>
      <NotificationBadgeProvider>
        <div className="h-full w-full overflow-hidden bg-gray-50">
        {/* Desktop max-width varies with sidebar state */}
        <style>{`@media(min-width:52rem){[data-sidebar-layout]{max-width:${desktopMaxWidth}px!important}}`}</style>

        {/* 사이드바 + 콘텐츠를 하나의 박스로 묶어 가운데 정렬 */}
        <div
          data-sidebar-layout
          className="mx-auto flex h-full w-full md:shadow-xl transition-[max-width] duration-300"
        >
          {/* Desktop: persistent sidebar */}
          <DesktopSidebar collapsed={collapsed} onToggle={handleDesktopToggle} />

          {/* Main content */}
          <div className="relative flex h-full w-full min-w-0 flex-1 flex-col border-x border-gray-100 bg-white shadow-xl md:border-l-0 md:shadow-none overflow-hidden">
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

            {/* Mobile: overlay sidebar (inside main content for absolute positioning) */}
            <MobileSidebar
              isOpen={mobileSidebarOpen}
              onClose={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
        </div>
      </NotificationBadgeProvider>
    </ToastProvider>
  );
}
