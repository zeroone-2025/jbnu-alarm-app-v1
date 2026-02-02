'use client';

import type { DayOfWeek } from '../types';

interface DaySelectorProps {
  availableDays: DayOfWeek[];
  selectedDays: DayOfWeek[];
  onDaysChange: (days: DayOfWeek[]) => void;
}

export default function DaySelector({
  availableDays,
  selectedDays,
  onDaysChange,
}: DaySelectorProps) {
  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      onDaysChange(selectedDays.filter((d) => d !== day));
    } else {
      onDaysChange([...selectedDays, day]);
    }
  };

  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-sm text-gray-500">표시할 요일:</span>
      <div className="flex gap-1">
        {availableDays.map((day) => (
          <button
            key={day}
            onClick={() => toggleDay(day)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
              selectedDays.includes(day)
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}
