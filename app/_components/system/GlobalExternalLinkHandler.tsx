'use client';

import { useEffect } from 'react';
import { openLinkInExternalBrowser } from '../../_lib/utils/external-browser';

export default function GlobalExternalLinkHandler() {
    useEffect(() => {
        // 현재 페이지의 URL을 외부 브라우저로 띄움
        // 페이지 로드 시점(마운트)에 한 번 실행
        if (typeof window !== 'undefined') {
            openLinkInExternalBrowser(window.location.href);
        }
    }, []);

    return null; // UI를 렌더링하지 않음
}
