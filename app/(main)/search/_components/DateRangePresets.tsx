'use client';

import type { DateRange } from '../_hooks/useSearchState';

interface DateRangePresetsProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
}

const PRESETS: { label: string; value: DateRange }[] = [
  { label: '1주', value: '1w' },
  { label: '1달', value: '1m' },
  { label: '3달', value: '3m' },
  { label: '전체', value: 'all' },
];

export default function DateRangePresets({ value, onChange }: DateRangePresetsProps) {
  return (
    <>
      {PRESETS.map((preset) => (
        <button
          key={preset.value}
          type="button"
          onClick={() => onChange(preset.value)}
          className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
            value === preset.value
              ? 'bg-gray-900 text-white shadow-md'
              : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {preset.label}
        </button>
      ))}
    </>
  );
}
