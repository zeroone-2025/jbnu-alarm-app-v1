'use client';

import type { ReactNode } from 'react';
import { FiEdit3 } from 'react-icons/fi';

interface Props {
  emoji?: string;
  title: string;
  count?: number;
  onEdit?: () => void;
  empty?: boolean;
  emptyText?: string;
  emptyCta?: string;
  children?: ReactNode;
}

export default function SectionCard({
  emoji,
  title,
  count,
  onEdit,
  empty,
  emptyText,
  emptyCta = '추가하기',
  children,
}: Props) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          {emoji && <span>{emoji}</span>}
          {title}
          {typeof count === 'number' && (
            <span className="ml-1 text-xs font-medium text-gray-400">{count}개</span>
          )}
        </h2>
        {onEdit && (
          <button
            onClick={onEdit}
            aria-label={`${title} 수정`}
            className="rounded-md p-1 text-gray-300 transition-colors hover:bg-gray-50 hover:text-gray-600"
          >
            <FiEdit3 size={15} />
          </button>
        )}
      </div>
      {empty ? (
        <div
          className={`w-full rounded-xl border border-dashed border-gray-200 px-3 py-5 text-center text-xs text-gray-400 ${
            onEdit ? 'cursor-pointer transition-colors hover:border-gray-300 hover:text-gray-500' : ''
          }`}
          role={onEdit ? 'button' : undefined}
          tabIndex={onEdit ? 0 : undefined}
          onClick={onEdit}
          onKeyDown={(e) => {
            if (!onEdit) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onEdit();
            }
          }}
        >
          {emptyText ?? `${title}을(를) 추가해보세요`}
          {onEdit && <span className="ml-1.5 font-medium text-gray-500">+ {emptyCta}</span>}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
