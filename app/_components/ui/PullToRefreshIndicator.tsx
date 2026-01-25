'use client';

interface PullToRefreshIndicatorProps {
    isPulling: boolean;
    pullDistance: number;
    refreshing: boolean;
}

/**
 * 당겨서 새로고침(Pull to Refresh) 상태를 보여주는 인디케이터 컴포넌트
 */
export default function PullToRefreshIndicator({
    isPulling,
    pullDistance,
    refreshing,
}: PullToRefreshIndicatorProps) {
    return (
        <div
            className="shrink-0 flex items-center justify-center bg-linear-to-b from-gray-50 to-transparent overflow-hidden"
            style={{
                height: refreshing ? '64px' : isPulling ? `${pullDistance}px` : '0px',
                opacity: refreshing ? 1 : isPulling ? Math.min(pullDistance / 50, 1) : 0,
                transition: (isPulling || refreshing) ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-out',
            }}
        >
            {refreshing ? (
                <div className="w-6 h-6 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
            ) : isPulling && pullDistance > 0 ? (
                <div
                    className="text-sm font-medium text-gray-600"
                    style={{
                        transform: `scale(${Math.min(pullDistance / 40, 1)})`,
                    }}
                >
                    {pullDistance > 30 ? '↓ 놓아서 새로고침' : '↓ 당겨서 새로고침'}
                </div>
            ) : null}
        </div>
    );
}
