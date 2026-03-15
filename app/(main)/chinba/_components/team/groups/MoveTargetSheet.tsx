'use client';

import { useState } from 'react';

interface MoveTargetSheetProps {
  memberNickname: string;
  groups: { name: string; isCurrent: boolean }[];
  onSelect: (groupIdx: number) => void;
  onCancel: () => void;
}

export default function MoveTargetSheet({
  memberNickname,
  groups,
  onSelect,
  onCancel,
}: MoveTargetSheetProps) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="w-[80%] max-w-xs rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center text-base font-semibold text-gray-900 mb-3">
          {memberNickname}을(를) 이동할 조 선택
        </p>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {groups.map((g, idx) => (
            <button
              key={idx}
              type="button"
              disabled={g.isCurrent}
              onClick={() => setSelected(idx)}
              className={`w-full text-left rounded-xl border p-3 transition-colors ${
                g.isCurrent
                  ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-default'
                  : selected === idx
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-sm font-medium">
                {g.name}
                {g.isCurrent && (
                  <span className="text-xs text-gray-300 ml-1">(현재)</span>
                )}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => selected !== null && onSelect(selected)}
            disabled={selected === null}
            className="flex-1 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50"
          >
            이동
          </button>
        </div>
      </div>
    </div>
  );
}
