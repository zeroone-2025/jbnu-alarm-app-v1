'use client';

import type { GroupSet } from '@/_types/team';

interface GroupFilterBarProps {
  groupSets: GroupSet[];
  selectedSetId: number | null;
  selectedGroupId: number | null;
  onSetChange: (setId: number | null) => void;
  onGroupChange: (groupId: number | null) => void;
}

export default function GroupFilterBar({
  groupSets,
  selectedSetId,
  selectedGroupId,
  onSetChange,
  onGroupChange,
}: GroupFilterBarProps) {
  if (groupSets.length === 0) return null;

  const selectedSet = groupSets.find((s) => s.id === selectedSetId) ?? null;
  const showSetRow = groupSets.length > 1;

  return (
    <div className="space-y-2">
      {/* 1행: 그룹세트 선택 */}
      {showSetRow && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              onSetChange(null);
              onGroupChange(null);
            }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedSetId === null
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          {groupSets.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                onSetChange(s.id);
                onGroupChange(null);
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedSetId === s.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* 2행: 조 선택 (그룹세트 선택 시) */}
      {selectedSet && selectedSet.groups.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onGroupChange(null)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedGroupId === null
                ? 'bg-gray-700 text-white'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            전체
          </button>
          {selectedSet.groups.map((g) => (
            <button
              key={g.id}
              onClick={() => onGroupChange(g.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedGroupId === g.id
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {selectedSet.name} - {g.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
