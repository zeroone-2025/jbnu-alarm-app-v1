import { FiRefreshCw } from 'react-icons/fi';

interface PullToRefreshIndicatorProps {
    isPulling: boolean;
    pullDistance: number;
    refreshing: boolean;
}

/**
 * 당겨서 새로고침(Pull to Refresh) 상태를 보여주는 프리미엄 인디케이터
 * - 팅 튕기는 애니메이션 효과
 * - 버블 모양의 아이콘 UI
 */
export default function PullToRefreshIndicator({
    isPulling,
    pullDistance,
    refreshing,
}: PullToRefreshIndicatorProps) {
    // 임계값(30)을 기준으로 회전 각도 계산 (최대 180도)
    const rotate = Math.min((pullDistance / 50) * 360, 360);

    // 등장 시 팅~ 하는 효과를 위한 스케일 계산
    const scale = Math.min(pullDistance / 40, 1);

    return (
        <div
            className="shrink-0 flex items-center justify-center overflow-hidden w-full"
            style={{
                height: refreshing ? '64px' : isPulling ? `${pullDistance}px` : '0px',
                opacity: refreshing ? 1 : isPulling ? Math.min(pullDistance / 30, 1) : 0,
                // 높이 변화는 부드럽게 하지만, 끝날 때는 팅기는 느낌(cubic-bezier)
                // 올라갈 때(isPulling=false) 더 천천히 부드럽게: 1.0s, soft ease-out
                transition: isPulling ? 'none' : 'height 1.0s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s ease-out',
            }}
        >
            {/* 둥근 버블 카드 */}
            <div
                className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100"
                style={{
                    transform: `scale(${refreshing ? 1 : scale})`,
                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' // 팅~ 하는 바운스 효과
                }}
            >
                {refreshing ? (
                    <div className="w-5 h-5 border-2 border-blue-600 rounded-full animate-spin border-t-transparent" />
                ) : (
                    <FiRefreshCw
                        size={20}
                        className="text-blue-500"
                        style={{
                            transform: `rotate(${rotate}deg)`,
                            transition: 'transform 0.2s linear'
                        }}
                    />
                )}
            </div>
        </div>
    );
}
