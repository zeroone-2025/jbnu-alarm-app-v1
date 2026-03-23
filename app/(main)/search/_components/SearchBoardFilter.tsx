'use client';

import { useState, lazy, Suspense } from 'react';

import { FiX } from 'react-icons/fi';

import FullPageModal from '@/_components/layout/FullPageModal';

const BoardFilterContent = lazy(
  () => import('../../filter/_components/BoardFilterContent'),
);

interface SearchBoardFilterProps {
  selectedBoards: string[];
  onChange: (boards: string[]) => void;
}

export default function SearchBoardFilter({ selectedBoards, onChange }: SearchBoardFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = (boards: string[]) => {
    onChange(boards);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const hasSelection = selectedBoards.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
          hasSelection
            ? 'bg-gray-900 text-white shadow-md'
            : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        <span>{hasSelection ? `${selectedBoards.length}개 게시판` : '게시판'}</span>
        {hasSelection && (
          <span
            role="button"
            onClick={handleClear}
            className="ml-0.5 rounded-full p-0.5 hover:bg-white/20"
            aria-label="게시판 필터 초기화"
          >
            <FiX size={13} />
          </span>
        )}
      </button>

      <FullPageModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="게시판 선택"
        mode="overlay"
      >
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            </div>
          }
        >
          <BoardFilterContent
            selectedBoards={selectedBoards}
            onApply={handleApply}
            onClose={() => setIsOpen(false)}
          />
        </Suspense>
      </FullPageModal>
    </>
  );
}
