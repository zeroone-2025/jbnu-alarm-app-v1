'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import type { TimetableClass } from '@/_types/timetable';
import AddClassModal from './AddClassModal';
import ClassDetailSheet from './ClassDetailSheet';

const DAY_LABELS_WEEKDAY = ['월', '화', '수', '목', '금'];
const DAY_LABELS_ALL = ['월', '화', '수', '목', '금', '토', '일'];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8~20
const BLOCK_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
  { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
  { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  { bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-200' },
];

interface TimetableGridProps {
  classes: TimetableClass[];
  cellHeight: number;
  showWeekends?: boolean;
  disabled?: boolean;
  onDisabledInteraction?: () => void;
  onAdd: (data: { name: string; location?: string; day: number; start_time: string; end_time: string }) => void;
  onDelete: (classId: number) => void;
  semester?: string;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

const TIME_COL_WIDTH = 28; // px

export default function TimetableGrid({ classes, cellHeight, showWeekends = false, disabled = false, onDisabledInteraction, onAdd, onDelete, semester }: TimetableGridProps) {
  const dayLabels = showWeekends ? DAY_LABELS_ALL : DAY_LABELS_WEEKDAY;
  const dayCount = dayLabels.length;
  const halfHour = cellHeight / 2;

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    day: number;
    startTime: string;
    endTime: string;
  }>({ isOpen: false, day: 0, startTime: '08:00', endTime: '09:00' });

  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    day: number;
    startRow: number;
    endRow: number;
  } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<TimetableClass | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  // Build color map: each unique class name gets a color
  const colorMap = useMemo(() => {
    const map = new Map<string, number>();
    const uniqueNames = [...new Set(classes.map((c) => c.name))];
    uniqueNames.forEach((name, i) => {
      map.set(name, i % BLOCK_COLORS.length);
    });
    return map;
  }, [classes]);

  const HEADER_HEIGHT = 28; // h-7 = 28px
  const BODY_PADDING = 8;  // pt-2 = 8px

  const getGridPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!gridRef.current) return null;
      const rect = gridRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top - HEADER_HEIGHT - BODY_PADDING;

      // Ignore clicks on header area
      if (y < 0) return null;

      const colWidth = (rect.width - TIME_COL_WIDTH) / dayCount;
      const day = Math.floor((x - TIME_COL_WIDTH) / colWidth);
      if (day < 0 || day >= dayCount) return null;

      const row = Math.floor(y / halfHour);
      return { day, row: Math.max(0, Math.min(row, HOURS.length * 2 - 1)) };
    },
    [dayCount, halfHour]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) { onDisabledInteraction?.(); return; }
      const touch = e.touches[0];
      const pos = getGridPosition(touch.clientX, touch.clientY);
      if (!pos) return;
      setDragState({ isDragging: true, day: pos.day, startRow: pos.row, endRow: pos.row });
    },
    [disabled, onDisabledInteraction, getGridPosition]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!dragState?.isDragging) return;
      const touch = e.touches[0];
      const pos = getGridPosition(touch.clientX, touch.clientY);
      if (!pos || pos.day !== dragState.day) return;
      setDragState((prev) => (prev ? { ...prev, endRow: pos.row } : null));
    },
    [dragState?.isDragging, dragState?.day, getGridPosition]
  );

  // Check if a new class overlaps with existing ones
  const hasOverlap = useCallback(
    (day: number, startTime: string, endTime: string) => {
      const newStart = timeToMinutes(startTime);
      const newEnd = timeToMinutes(endTime);
      return classes.some(
        (cls) =>
          cls.day === day &&
          timeToMinutes(cls.start_time) < newEnd &&
          timeToMinutes(cls.end_time) > newStart
      );
    },
    [classes]
  );

  const openModalIfNoOverlap = useCallback(
    (day: number, startTime: string, endTime: string) => {
      if (hasOverlap(day, startTime, endTime)) return;
      setModalState({ isOpen: true, day, startTime, endTime });
    },
    [hasOverlap]
  );

  const handleTouchEnd = useCallback(() => {
    if (!dragState?.isDragging) return;
    const minRow = Math.min(dragState.startRow, dragState.endRow);
    const maxRow = Math.max(dragState.startRow, dragState.endRow);

    const startMinutes = 8 * 60 + minRow * 30;
    const endMinutes = 8 * 60 + (maxRow + 1) * 30;
    openModalIfNoOverlap(dragState.day, minutesToTime(startMinutes), minutesToTime(endMinutes));
    setDragState(null);
  }, [dragState, openModalIfNoOverlap]);

  // Mouse drag for desktop
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) { onDisabledInteraction?.(); return; }
      if (e.button !== 0) return;
      const pos = getGridPosition(e.clientX, e.clientY);
      if (!pos) return;
      setDragState({ isDragging: true, day: pos.day, startRow: pos.row, endRow: pos.row });
    },
    [disabled, onDisabledInteraction, getGridPosition]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragState?.isDragging) return;
      const pos = getGridPosition(e.clientX, e.clientY);
      if (!pos || pos.day !== dragState.day) return;
      setDragState((prev) => (prev ? { ...prev, endRow: pos.row } : null));
    },
    [dragState?.isDragging, dragState?.day, getGridPosition]
  );

  const handleMouseUp = useCallback(() => {
    if (!dragState?.isDragging) return;
    const minRow = Math.min(dragState.startRow, dragState.endRow);
    const maxRow = Math.max(dragState.startRow, dragState.endRow);

    const startMinutes = 8 * 60 + minRow * 30;
    const endMinutes = 8 * 60 + (maxRow + 1) * 30;
    openModalIfNoOverlap(dragState.day, minutesToTime(startMinutes), minutesToTime(endMinutes));
    setDragState(null);
  }, [dragState, openModalIfNoOverlap]);

  const handleClassTap = (cls: TimetableClass) => {
    setDeleteTarget(cls);
  };

  const handleModalSubmit = (data: { name: string; location?: string; day: number; start_time: string; end_time: string }) => {
    onAdd(data);
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  // Render selection highlight
  const renderDragHighlight = () => {
    if (!dragState?.isDragging) return null;
    const minRow = Math.min(dragState.startRow, dragState.endRow);
    const maxRow = Math.max(dragState.startRow, dragState.endRow);
    const top = minRow * halfHour + 8; // +8 for pt-2
    const height = (maxRow - minRow + 1) * halfHour;
    const colWidth = `calc((100% - ${TIME_COL_WIDTH}px) / ${dayCount})`;
    const left = `calc(${TIME_COL_WIDTH}px + ${dragState.day} * (100% - ${TIME_COL_WIDTH}px) / ${dayCount})`;

    return (
      <div
        className="pointer-events-none absolute z-10 rounded bg-gray-900/10 border-2 border-gray-400"
        style={{ top, height, left, width: colWidth }}
      />
    );
  };

  const gridTemplateColumns = `${TIME_COL_WIDTH}px repeat(${dayCount}, 1fr)`;

  return (
    <>
      <div
        ref={gridRef}
        className="relative select-none overflow-hidden h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => dragState?.isDragging && setDragState(null)}
      >
        {/* Header row */}
        <div className="sticky top-0 z-20 grid bg-white border-b border-gray-200" style={{ gridTemplateColumns }}>
          <div className="h-7" />
          {dayLabels.map((label, i) => (
            <div key={i} className="flex h-7 items-center justify-center text-[11px] font-medium text-gray-500">
              {label}
            </div>
          ))}
        </div>

        {/* Grid body */}
        <div className="relative pt-2" style={{ height: HOURS.length * cellHeight + 8 }}>
          {/* Time labels + grid lines */}
          {HOURS.map((hour, i) => (
            <div key={hour} className="absolute w-full" style={{ top: i * cellHeight + 8 }}>
              <div className="grid" style={{ gridTemplateColumns }}>
                <div className="flex items-start justify-end pr-1 text-[10px] text-gray-400 -mt-1.5">
                  {hour}
                </div>
                {dayLabels.map((_, j) => (
                  <div key={j} className="border-t border-l border-gray-100" style={{ height: cellHeight }} />
                ))}
              </div>
            </div>
          ))}

          {/* Drag highlight */}
          {renderDragHighlight()}

          {/* Class blocks */}
          {classes.map((cls) => {
            const startMin = timeToMinutes(cls.start_time);
            const endMin = timeToMinutes(cls.end_time);
            const baseMin = 8 * 60;
            const top = ((startMin - baseMin) / 60) * cellHeight + 8; // +8 for pt-2
            const height = ((endMin - startMin) / 60) * cellHeight;
            const colorIdx = colorMap.get(cls.name) ?? 0;
            const color = BLOCK_COLORS[colorIdx];
            const left = `calc(${TIME_COL_WIDTH}px + ${cls.day} * (100% - ${TIME_COL_WIDTH}px) / ${dayCount})`;

            return (
              <div
                key={cls.id}
                className={`absolute z-10 cursor-pointer overflow-hidden rounded-md border p-1 ${color.bg} ${color.border} active:opacity-70`}
                style={{
                  top: top + 1,
                  height: height - 2,
                  left,
                  width: `calc((100% - ${TIME_COL_WIDTH}px) / ${dayCount} - 2px)`,
                  marginLeft: 1,
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClassTap(cls);
                }}
              >
                <div className={`text-[10px] font-bold leading-tight ${color.text} break-words`}>
                  {cls.name}
                </div>
                {cls.location && height > 40 && (
                  <div className={`text-[9px] leading-tight ${color.text} opacity-70 truncate mt-0.5`}>
                    {cls.location}
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty state hint */}
          {classes.length === 0 && (
            <div className="absolute inset-0 flex items-start justify-center pointer-events-none pt-[14vh]">
              <p className="text-lg text-gray-300">드래그하여 내 고정 일정 추가/수정</p>
            </div>
          )}
        </div>
      </div>

      <AddClassModal
        isOpen={modalState.isOpen}
        day={modalState.day}
        startTime={modalState.startTime}
        endTime={modalState.endTime}
        onSubmit={handleModalSubmit}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
      />

      <ClassDetailSheet
        cls={deleteTarget}
        semester={semester}
        onClose={() => setDeleteTarget(null)}
        onDelete={(id) => { onDelete(id); }}
      />
    </>
  );
}
