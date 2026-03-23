'use client';

import DateRangePresets from './DateRangePresets';
import SearchBoardFilter from './SearchBoardFilter';
import type { DateRange } from '../_hooks/useSearchState';

interface SearchFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (value: DateRange) => void;
  selectedBoards: string[];
  onBoardsChange: (boards: string[]) => void;
}

export default function SearchFilters({
  dateRange,
  onDateRangeChange,
  selectedBoards,
  onBoardsChange,
}: SearchFiltersProps) {
  return (
    <div className="flex flex-row items-center gap-2 overflow-x-auto px-4 py-1.5 no-scrollbar">
      <DateRangePresets value={dateRange} onChange={onDateRangeChange} />
      <SearchBoardFilter selectedBoards={selectedBoards} onChange={onBoardsChange} />
    </div>
  );
}
