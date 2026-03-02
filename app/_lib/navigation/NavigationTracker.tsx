'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const HAS_HISTORY_KEY = '__zt_has_app_history';

export default function NavigationTracker() {
  const pathname = usePathname();
  const initialPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== initialPathname.current) {
      sessionStorage.setItem(HAS_HISTORY_KEY, '1');
    }
  }, [pathname]);

  return null;
}
