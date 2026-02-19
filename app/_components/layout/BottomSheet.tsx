'use client';

import { useRef, useCallback, type ReactNode } from 'react';

interface BottomSheetProps {
  /** Handle area에 표시할 제목 */
  title: string;
  /** 완전히 접혔을 때 최소 높이 - 핸들만 보임 (px). 기본값 56 */
  minHeight?: number;
  /** 기본 resting 높이 (px). 기본값 200 */
  peekHeight?: number;
  /** 펼쳤을 때 최대 높이 (vh 비율, 0~1). 기본값 0.65 */
  maxHeightRatio?: number;
  /** 시트 내부에 렌더링할 컨텐츠 */
  children: ReactNode;
  /** 추가 className (외부에서 스타일 오버라이드용) */
  className?: string;
}

/** 가장 가까운 스냅 포인트를 찾는 유틸 */
function findClosestSnap(value: number, points: number[]): number {
  let closest = points[0];
  let minDist = Math.abs(value - closest);
  for (let i = 1; i < points.length; i++) {
    const dist = Math.abs(value - points[i]);
    if (dist < minDist) {
      closest = points[i];
      minDist = dist;
    }
  }
  return closest;
}

export default function BottomSheet({
  title,
  minHeight = 56,
  peekHeight = 200,
  maxHeightRatio = 0.65,
  children,
  className = '',
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragInfo = useRef({ active: false, startY: 0, startH: 0 });

  const getMaxHeight = useCallback(
    () => window.innerHeight * maxHeightRatio,
    [maxHeightRatio],
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const el = sheetRef.current;
    if (!el) return;
    el.style.transition = 'none';
    dragInfo.current = { active: true, startY: e.clientY, startH: el.offsetHeight };
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const el = sheetRef.current;
      if (!dragInfo.current.active || !el) return;
      const dy = dragInfo.current.startY - e.clientY;
      const maxH = getMaxHeight();
      const next = Math.max(minHeight, Math.min(maxH, dragInfo.current.startH + dy));
      el.style.height = `${next}px`;
    },
    [minHeight, getMaxHeight],
  );

  const onPointerUp = useCallback(() => {
    const el = sheetRef.current;
    if (!dragInfo.current.active || !el) return;
    dragInfo.current.active = false;

    const cur = el.offsetHeight;
    const maxH = getMaxHeight();
    const moved = Math.abs(cur - dragInfo.current.startH);
    const snaps = [minHeight, peekHeight, maxH];

    el.style.transition = 'height 300ms ease-out';

    if (moved < 5) {
      // Tap: cycle to next snap point
      const startH = dragInfo.current.startH;
      if (startH <= minHeight + 10) {
        el.style.height = `${peekHeight}px`;
      } else if (startH >= maxH - 10) {
        el.style.height = `${peekHeight}px`;
      } else {
        el.style.height = `${maxH}px`;
      }
    } else {
      // Drag: snap to nearest of 3 points
      el.style.height = `${findClosestSnap(cur, snaps)}px`;
    }
  }, [minHeight, peekHeight, getMaxHeight]);

  return (
    <div
      ref={sheetRef}
      style={{ height: peekHeight }}
      className={`shrink-0 border-t border-gray-200 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden ${className}`}
    >
      {/* Drag Handle */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="shrink-0 flex flex-col items-center pt-2.5 pb-2 cursor-grab active:cursor-grabbing touch-none select-none"
      >
        <div className="w-10 h-1 rounded-full bg-gray-300 mb-2" />
        <span className="text-xs font-bold text-gray-500">{title}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
