'use client';

import { useState } from 'react';

import { FiCopy, FiShare2, FiRefreshCw } from 'react-icons/fi';

import { formatInviteUrl } from '@/_lib/utils/teamDisplay';

interface InviteSectionProps {
  inviteCode: string | null;
  canRegenerate: boolean;
  onRegenerate: () => void;
  isRegenerating?: boolean;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function InviteSection({
  inviteCode,
  canRegenerate,
  onRegenerate,
  isRegenerating = false,
  onShowToast,
}: InviteSectionProps) {
  const [copied, setCopied] = useState(false);

  if (!inviteCode) {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center">
        <p className="text-sm text-gray-400">초대 링크가 없습니다</p>
      </div>
    );
  }

  const inviteUrl = formatInviteUrl(inviteCode);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      onShowToast('초대 링크가 복사되었습니다', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast('복사에 실패했습니다', 'error');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '팀 초대',
          text: '팀에 참여하세요!',
          url: inviteUrl,
        });
      } catch {
        // User cancelled sharing
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-3">
      {/* Invite code display */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
        <p className="text-[11px] text-gray-400 mb-1">초대 코드</p>
        <p className="text-sm font-mono font-medium text-gray-700 break-all">
          {inviteCode}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:scale-95"
        >
          <FiCopy size={14} />
          {copied ? '복사됨' : '링크 복사'}
        </button>
        <button
          onClick={handleShare}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 active:scale-95"
        >
          <FiShare2 size={14} />
          공유하기
        </button>
      </div>

      {/* Regenerate */}
      {canRegenerate && (
        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-100 py-2.5 text-xs text-gray-400 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <FiRefreshCw size={12} className={isRegenerating ? 'animate-spin' : ''} />
          초대 코드 재생성
        </button>
      )}
    </div>
  );
}
