'use client';

import { useState } from 'react';

interface EventHeaderProps {
  title: string;
  eventId: string;
}

export default function EventHeader({ title, eventId }: EventHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/chinba/${eventId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3">
        {/* 친바 로고 */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm">
          친
        </div>
        <span className="text-lg font-semibold tracking-tight">{title}</span>
      </div>

      {/* 초대 링크 복사 버튼 */}
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        {copied ? '복사됨!' : '초대 링크 복사'}
      </button>
    </header>
  );
}
