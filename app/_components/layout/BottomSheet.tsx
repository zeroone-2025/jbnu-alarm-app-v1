'use client';

import { useRef, useCallback, type ReactNode } from 'react';

interface BottomSheetProps {
  /** Handle area에 표시할 제목 */
  title: string;
  /** 완전히 접혔을 때 최소 높이 - 핸들만 보임 (px). 기본값 56 */
  minHeight?: number;
  /** 기본 resting 높이 (px). 기본값 200 */
  peekHeight?: number;
  /** 중간 높이 (vh 비율, 0~1). 기본값 0.5 */
  midHeightRatio?: number;
  /** 펼쳤을 때 최대 높이 (vh 비율, 0~1). 기본값 0.80 */
  maxHeightRatio?: number;
  /** 드래그/탭 차단 여부. true이면 조작 불가 */
  disabled?: boolean;
  /** disabled일 때 드래그/탭 시도 시 호출되는 콜백 */
  onDisabledInteraction?: () => void;
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
  midHeightRatio = 0.8,
  maxHeightRatio = 0.99,
  disabled = false,
  onDisabledInteraction,
  children,
  className = '',
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragInfo = useRef({ active: false, startY: 0, startH: 0 });

  const getMidHeight = useCallback(
    () => window.innerHeight * midHeightRatio,
    [midHeightRatio],
  );

  const getMaxHeight = useCallback(
    () => window.innerHeight * maxHeightRatio,
    [maxHeightRatio],
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) {
      onDisabledInteraction?.();
      return;
    }
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const el = sheetRef.current;
    if (!el) return;
    el.style.transition = 'none';
    dragInfo.current = { active: true, startY: e.clientY, startH: el.offsetHeight };
  }, [disabled, onDisabledInteraction]);

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
    const midH = getMidHeight();
    const maxH = getMaxHeight();
    const moved = Math.abs(cur - dragInfo.current.startH);
    const snaps = [minHeight, peekHeight, midH, maxH];

    el.style.transition = 'height 300ms ease-out';

    if (moved < 5) {
      // Tap: cycle to next snap point
      const startH = dragInfo.current.startH;
      if (startH <= minHeight + 10) {
        el.style.height = `${peekHeight}px`;
      } else if (startH <= peekHeight + 10) {
        el.style.height = `${midH}px`;
      } else if (startH <= midH + 10) {
        el.style.height = `${maxH}px`;
      } else {
        el.style.height = `${peekHeight}px`;
      }
    } else {
      // Drag: snap to nearest of 4 points
      el.style.height = `${findClosestSnap(cur, snaps)}px`;
    }
  }, [minHeight, peekHeight, getMidHeight, getMaxHeight]);

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
