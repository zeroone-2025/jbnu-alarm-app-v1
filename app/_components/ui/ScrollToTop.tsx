'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import { scrollToTop } from '@/_lib/utils/scroll';

interface ScrollToTopProps {
    containerRef?: React.RefObject<HTMLElement | null>;
    threshold?: number;
}

/**
 * 재사용 가능한 상단 이동(ScrollToTop) 버튼 컴포넌트
 * @param containerRef - 스크롤을 감지할 컨테이너의 ref. 생략 시 window 감시.
 * @param threshold - 버튼이 나타날 스크롤 깊이 (기본값: 400)
 */
export default function ScrollToTop({ containerRef, threshold = 400 }: ScrollToTopProps) {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = useCallback(() => {
        const scrollY = containerRef?.current
            ? containerRef.current.scrollTop
            : window.scrollY;

        if (scrollY > threshold) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [containerRef, threshold]);

    useEffect(() => {
        const target = containerRef?.current || window;

        // 초기 상태 체크
        toggleVisibility();

        target.addEventListener('scroll', toggleVisibility);
        return () => target.removeEventListener('scroll', toggleVisibility);
    }, [containerRef, toggleVisibility]);

    const handleScrollToTop = () => {
        scrollToTop({ container: containerRef?.current ?? undefined });
    };

    return (
        <button
            onClick={handleScrollToTop}
            className={`absolute bottom-14 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-900 shadow-xl border border-gray-100 transition-all active:scale-95 md:h-12 md:w-12 ${isVisible
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
            aria-label="맨 위로 이동"
        >
            <FiArrowUp size={24} strokeWidth={3} />
        </button>
    );
}
