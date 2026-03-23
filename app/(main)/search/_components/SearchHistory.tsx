'use client';

import { FiClock, FiX } from 'react-icons/fi';

interface SearchHistoryProps {
  history: string[];
  onSelect: (term: string) => void;
  onRemove: (term: string) => void;
}

export default function SearchHistory({ history, onSelect, onRemove }: SearchHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="px-4 py-2">
      <h3 className="mb-2 text-xs font-bold text-gray-500">최근 검색</h3>
      <ul className="flex flex-col">
        {history.map((term) => (
          <li key={term} className="flex items-center gap-2 py-2.5">
            <FiClock size={15} className="shrink-0 text-gray-400" />
            <button
              type="button"
              onClick={() => onSelect(term)}
              className="flex-1 text-left text-sm text-gray-700 hover:text-gray-900"
            >
              {term}
            </button>
            <button
              type="button"
              onClick={() => onRemove(term)}
              className="shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label={`"${term}" 삭제`}
            >
              <FiX size={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
