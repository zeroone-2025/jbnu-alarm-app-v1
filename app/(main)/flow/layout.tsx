'use client';

import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import BottomTabBar from './_components/BottomTabBar';

const BOTTOM_TAB_PATHS = new Set(['/flow', '/flow/career', '/flow/companies']);

/** /flow/companies?id=N 상세 모드에선 BottomTabBar 숨김 */
function MaybeBottomTabBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const normalized = pathname.replace(/\/$/, '') || '/';
  const hasIdQuery = Boolean(searchParams.get('id'));
  const isCompanyDetail = normalized === '/flow/companies' && hasIdQuery;

  const showBottomTab = !isCompanyDetail && BOTTOM_TAB_PATHS.has(normalized);
  if (!showBottomTab) return null;
  return <BottomTabBar />;
}

export default function FlowLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
      <Suspense fallback={null}>
        <MaybeBottomTabBar />
      </Suspense>
    </div>
  );
}
