'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { FiCheck, FiCopy, FiShare2, FiUsers } from 'react-icons/fi';

import { formatInviteUrl } from '@/_lib/utils/teamDisplay';

interface TeamSetupGuideProps {
  teamId: number;
  memberCount: number;
  inviteCode: string | null;
  hasGroups: boolean;
}

export default function TeamSetupGuide({ teamId, memberCount, inviteCode, hasGroups }: TeamSetupGuideProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  if (hasGroups) return null;

  const isStep1Done = memberCount > 1;
  const inviteUrl = inviteCode ? formatInviteUrl(inviteCode) : null;

  const handleCopy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent fail
    }
  };

  const handleShare = async () => {
    if (!inviteUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: '팀 초대',
          text: '팀에 참여하세요!',
          url: inviteUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 space-y-3">
      {/* Step 1 */}
      {!isStep1Done ? (
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <span className="text-xs font-bold text-blue-600">①</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">팀원을 초대하세요</p>
            <p className="text-xs text-gray-500 mt-0.5">초대 링크를 공유해서 팀원을 모아보세요</p>
            {inviteUrl && (
              <div className="flex gap-2 mt-2.5">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 active:scale-95"
                >
                  <FiCopy size={12} />
                  {copied ? '복사됨' : '링크 복사'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800 active:scale-95"
                >
                  <FiShare2 size={12} />
                  공유하기
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
            <FiCheck size={12} className="text-green-600" />
          </div>
          <p className="text-sm font-medium text-gray-500">팀원 초대 완료 ({memberCount}명)</p>
        </div>
      )}

      {/* Step 2 */}
      {!isStep1Done ? (
        <div className="flex items-center gap-3 pl-11">
          <p className="text-xs text-gray-400">② 조 편성하기 (팀원 초대 후 가능)</p>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <FiUsers size={14} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">조를 편성해보세요</p>
            <p className="text-xs text-gray-500 mt-0.5">팀원을 바탕으로 조를 나누면 조별 일정 관리가 가능해요</p>
            <button
              onClick={() => router.push(`/chinba/team/groups?id=${teamId}`)}
              className="mt-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              조 편성하러 가기 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
