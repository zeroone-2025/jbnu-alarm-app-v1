'use client';
import { useEffect, useState } from 'react';

/**
 * 개발 호스트 감지 및 robots meta 태그 추가
 * Static export에서는 headers()를 사용할 수 없으므로 클라이언트 측에서 감지
 */
export default function DevHostMetaTag() {
    const [isDevHost, setIsDevHost] = useState(false);

    useEffect(() => {
        const host = window.location.host;
        setIsDevHost(host === 'dev.zerotime.kr' || host.startsWith('dev.zerotime.kr:'));
    }, []);

    if (!isDevHost) return null;

    return <meta name="robots" content="noindex, nofollow" />;
}
