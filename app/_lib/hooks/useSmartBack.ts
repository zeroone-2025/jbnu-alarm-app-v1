'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

const HAS_HISTORY_KEY = '__zt_has_app_history';

export function useSmartBack(fallbackPath: string = '/') {
  const router = useRouter();

  return useCallback(() => {
    const hasAppHistory = sessionStorage.getItem(HAS_HISTORY_KEY) === '1';
    if (hasAppHistory) {
      router.back();
    } else {
      router.replace(fallbackPath);
    }
  }, [router, fallbackPath]);
}
