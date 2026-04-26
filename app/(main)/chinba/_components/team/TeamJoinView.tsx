'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { FiUsers } from 'react-icons/fi';

import Button from '@/_components/ui/Button';
import FullPageModal from '@/_components/layout/FullPageModal';
import { useToast } from '@/_context/ToastContext';
import { useSmartBack } from '@/_lib/hooks/useSmartBack';
import { useJoinTeam } from '@/_lib/hooks/useTeam';

export default function TeamJoinView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const goBack = useSmartBack('/chinba/team');
  const joinTeam = useJoinTeam();
  const { showToast } = useToast();

  const initialCode = searchParams.get('code') || '';
  const [inviteCode, setInviteCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = inviteCode.trim().length > 0 && !joinTeam.isPending;

  const handleJoin = async () => {
    if (!canSubmit) return;
    setError(null);

    try {
      const result = await joinTeam.mutateAsync({
        invite_code: inviteCode.trim(),
      });
      showToast(`${result.team_name}에 가입되었습니다`, 'success');
      router.replace(`/chinba/team/detail?id=${result.team_id}`);
    } catch (err: any) {
      const detail = err.response?.data?.detail || '가입에 실패했습니다';
      setError(detail);
      showToast(detail, 'error');
    }
  };

  return (
    <FullPageModal isOpen={true} onClose={goBack} title="동아리 가입">
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="flex flex-col items-center py-8">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
            <FiUsers size={28} className="text-gray-400" />
          </div>

          {error && (
            <div className="mb-4 w-full rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="w-full mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              초대 코드
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="초대 코드를 입력하세요"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-900 transition-colors text-center font-mono"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-4 py-3 pb-safe border-t border-gray-100">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleJoin}
          disabled={!canSubmit}
        >
          {joinTeam.isPending ? '가입 중...' : '가입하기'}
        </Button>
      </div>
    </FullPageModal>
  );
}
