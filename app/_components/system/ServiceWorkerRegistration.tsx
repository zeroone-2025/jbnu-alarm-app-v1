'use client';

import { useEffect } from 'react';
import { registerServiceWorkerUpdateHandler } from '@/_lib/utils/sw-update-handler';

/**
 * Service Worker 등록을 위한 클라이언트 컴포넌트
 * 앱 시작 시 자동으로 Service Worker를 등록하고 업데이트를 체크합니다.
 */
export default function ServiceWorkerRegistration() {
    useEffect(() => {
        // 프로덕션 환경에서만 Service Worker 등록
        if (process.env.NODE_ENV === 'production') {
            registerServiceWorkerUpdateHandler();
        }
    }, []);

    // UI를 렌더링하지 않음
    return null;
}
