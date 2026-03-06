'use client';

import { FiSettings } from 'react-icons/fi';

interface KeywordSettingsBarProps {
  keywordCount: number;
  onSettingsClick: () => void;
}

export default function KeywordSettingsBar({
  keywordCount,
  onSettingsClick,
}: KeywordSettingsBarProps) {
  return (
    <div className="shrink-0 border-b border-gray-100 bg-white px-5 py-3">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
        <span className="text-sm font-medium text-gray-700">
          알림 받는 키워드 {keywordCount}개
        </span>
        <button
          onClick={onSettingsClick}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-100"
          aria-label="키워드 설정"
        >
          <FiSettings size={16} />
          설정
        </button>
      </div>
    </div>
  );
}
