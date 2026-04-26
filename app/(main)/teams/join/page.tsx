'use client';

import { useState, useEffect } from 'react';
import { Suspense } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import { FiUsers } from 'react-icons/fi';
import { LuChevronLeft } from 'react-icons/lu';

import Button from '@/_components/ui/Button';
import { useToast } from '@/_context/ToastContext';
import { useSmartBack } from '@/_lib/hooks/useSmartBack';
import { useJoinTeam } from '@/_lib/hooks/useTeam';

function JoinTeamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const smartBack = useSmartBack('/teams');
  const joinTeam = useJoinTeam();
  const { showToast } = useToast();

  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Auto-fill from URL params
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setInviteCode(code);
    }
  }, [searchParams]);

  const canSubmit = inviteCode.trim().length > 0 && !joinTeam.isPending;

  const handleJoin = async () => {
    if (!canSubmit) return;
    setError(null);

    try {
      const result = await joinTeam.mutateAsync({
        invite_code: inviteCode.trim(),
      });
      showToast(`${result.team_name}에 가입되었습니다`, 'success');
      router.replace(`/teams/${result.team_id}`);
    } catch (err: any) {
      const detail = err.response?.data?.detail || '가입에 실패했습니다';
      setError(detail);
      showToast(detail, 'error');
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="shrink-0 px-4 pb-3">
        <div className="pt-safe md:pt-0" />
        <div className="relative mt-4 flex items-center justify-center">
          <button
            onClick={smartBack}
            className="absolute left-0 z-10 group -ml-1 rounded-full p-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95"
            aria-label="뒤로가기"
          >
            <LuChevronLeft size={24} strokeWidth={2.5} className="transition-transform group-hover:-translate-x-0.5" />
          </button>
          <h1 className="text-base font-bold text-gray-800">팀 가입</h1>
        </div>
      </div>

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
    </div>
  );
}

export default function JoinTeamPage() {
  return (
    <Suspense fallback={null}>
      <JoinTeamContent />
    </Suspense>
  );
}
