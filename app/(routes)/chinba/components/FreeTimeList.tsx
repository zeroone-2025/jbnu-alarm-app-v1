'use client';

import type { FreeTimeSlot } from '../types';

interface FreeTimeListProps {
  freeTimeSlots: FreeTimeSlot[];
  onSlotClick?: (dt: string) => void;
}

export default function FreeTimeList({
  freeTimeSlots,
  onSlotClick,
}: FreeTimeListProps) {
  // 요일별로 그룹화
  const groupedByDay = freeTimeSlots.reduce((acc, slot) => {
    if (!acc[slot.day]) {
      acc[slot.day] = [];
    }
    acc[slot.day].push(slot);
    return acc;
  }, {} as Record<string, FreeTimeSlot[]>);

  const days = ['월', '화', '수', '목', '금', '토', '일'];

  return (
    <div>
      <h2 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        FREE TIME (빈 시간)
      </h2>

      <div className="space-y-3">
        {days.map((day) => {
          const slots = groupedByDay[day] || [];

          return (
            <div key={day}>
              <div className="text-xs font-medium text-gray-500 mb-1.5">
                {day}요일
              </div>
              {slots.length > 0 ? (
                <div className="space-y-1.5">
                  {slots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => onSlotClick?.(slot.dt)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors text-left"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-sm text-emerald-700">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic px-3 py-2">
                  빈 시간이 없습니다
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
