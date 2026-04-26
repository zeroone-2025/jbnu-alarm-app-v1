'use client';

import { useEffect, useRef, useState } from 'react';
import { useTeamStats } from '@/_lib/hooks/useTeamStats';
import { FiUsers } from 'react-icons/fi';

// 각 자릿수를 아래에서 위로 슬라이드하는 컴포넌트
function RollingDigit({ digit, delay }: { digit: string; delay: number }) {
    const [prevDigit, setPrevDigit] = useState(digit);
    const [isRolling, setIsRolling] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (digit !== prevDigit) {
            setIsRolling(true);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                setPrevDigit(digit);
                setIsRolling(false);
            }, 600 + delay);
        }
    }, [digit, delay]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    if (!/\d/.test(digit)) {
        return <span>{digit}</span>;
    }

    return (
        <span
            className="inline-block overflow-hidden relative"
            style={{ width: '1ch', height: '1em', lineHeight: '1', textAlign: 'center' }}
        >
            <span
                className="block"
                style={{
                    transition: `transform ${0.6 + delay}s cubic-bezier(0.16, 1, 0.3, 1), opacity ${0.4 + delay}s ease`,
                    transform: isRolling ? 'translateY(-100%)' : 'translateY(0)',
                    opacity: isRolling ? 0 : 1,
                }}
            >
                {prevDigit}
            </span>
            <span
                className="block absolute top-0 left-0 right-0"
                style={{
                    transition: `transform ${0.6 + delay}s cubic-bezier(0.16, 1, 0.3, 1), opacity ${0.4 + delay}s ease`,
                    transform: isRolling ? 'translateY(0)' : 'translateY(100%)',
                    opacity: isRolling ? 1 : 0,
                }}
            >
                {digit}
            </span>
        </span>
    );
}

// 숫자 카운트업 + 롤링 애니메이션 결합
function AnimatedCount({ value }: { value: number }) {
    const [displayValue, setDisplayValue] = useState(0);
    const prevTargetRef = useRef(0);
    const startTimeRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (value === 0) return;

        const startValue = prevTargetRef.current;
        prevTargetRef.current = value;
        startTimeRef.current = null;
        const duration = startValue === 0 ? 3500 : 1500;

        const animate = (currentTime: number) => {
            if (startTimeRef.current === null) {
                startTimeRef.current = currentTime;
            }

            const elapsed = currentTime - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            const current = Math.round(startValue + (value - startValue) * easeProgress);
            setDisplayValue(current);

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            } else {
                setDisplayValue(value);
            }
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [value]);

    const formatted = displayValue.toLocaleString('ko-KR');
    const chars = formatted.split('');

    return (
        <span className="inline-flex items-baseline font-bold text-blue-600" style={{ fontVariantNumeric: 'tabular-nums' }} aria-label={`${displayValue}개`}>
            {chars.map((char, i) => (
                <RollingDigit
                    key={`${chars.length}-${i}`}
                    digit={char}
                    delay={i * 0.03}
                />
            ))}
            <span>개</span>
        </span>
    );
}

export default function TeamStatsBanner() {
    const { data: stats, isLoading } = useTeamStats();

    if (isLoading || !stats) return null;

    return (
        <div className="mx-4 mb-3 px-4 py-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 animate-slideDown">
            <div className="flex items-start gap-3">
                <FiUsers size={20} className="text-blue-600 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700">
                    친해지기 바래는 <AnimatedCount value={stats.total_teams} />의 동아리와 함께하고 있어요
                </p>
            </div>
        </div>
    );
}
