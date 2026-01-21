import { useState, useRef, useEffect, RefObject } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  enabled?: boolean;
  threshold?: number;
  maxDistance?: number;
}

export function usePullToRefresh({
  onRefresh,
  enabled = true,
  threshold = 30,
  maxDistance = 80,
}: UsePullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  const touchStartY = useRef(0);
  const isPullingRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const lastDistanceRef = useRef(0);
  const scrollContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    isPullingRef.current = isPulling;
  }, [isPulling]);

  useEffect(() => {
    pullDistanceRef.current = pullDistance;
  }, [pullDistance]);

  const handleTouchStart = (e: TouchEvent) => {
    if (!enabled) return;
    
    const container = scrollContainerRef.current;
    if (!container) return;

    if (container.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
      lastDistanceRef.current = 0;
    } else {
      touchStartY.current = 0;
      lastDistanceRef.current = 0;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!enabled) return;
    
    const container = scrollContainerRef.current;
    if (!container || touchStartY.current === 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStartY.current;

    if (distance > 0 && container.scrollTop <= 0) {
      e.preventDefault();
      
      // 손가락을 위로 올리는 중이면 (distance가 줄어듦) 텍스트 숨김
      if (distance < lastDistanceRef.current) {
        setIsPulling(false);
        setPullDistance(0);
      } else {
        setIsPulling(true);
        // Rubber band effect: 저항감을 주기 위한 감쇠 함수
        const dampingFactor = 0.5;
        const dampedDistance = maxDistance * (1 - Math.exp(-distance * dampingFactor / maxDistance));
        setPullDistance(Math.min(dampedDistance, maxDistance));
      }
      
      lastDistanceRef.current = distance;
    } else {
      // 위로 스크롤하거나 조건 벗어나면 초기화
      setIsPulling(false);
      setPullDistance(0);
      lastDistanceRef.current = 0;
    }
  };

  const handleTouchEnd = async () => {
    if (!enabled) return;
    
    if (isPullingRef.current && pullDistanceRef.current > threshold) {
      // threshold 이상 당기면 새로고침
      setIsPulling(false);
      setPullDistance(0);
      touchStartY.current = 0;
      lastDistanceRef.current = 0;
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
      return;
    }

    // 상태 초기화
    setIsPulling(false);
    setPullDistance(0);
    touchStartY.current = 0;
    lastDistanceRef.current = 0;
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !enabled) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return {
    scrollContainerRef: scrollContainerRef as RefObject<HTMLDivElement>,
    isPulling,
    pullDistance,
    refreshing,
  };
}
