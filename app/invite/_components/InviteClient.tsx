'use client';

import { useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import LoadingSpinner from '@/_components/ui/LoadingSpinner';
import { joinTeam } from '@/_lib/api/teams';
import { hasAccessToken } from '@/_lib/auth/tokenStore';
import { getLoginUrl } from '@/_lib/utils/requireLogin';
import { useAuthInitialized } from '@/providers';

type JoinState = 'loading' | 'joining' | 'success' | 'already' | 'error';

export default function InviteClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isAuthReady = useAuthInitialized();
  const code = searchParams.get('code');

  const [state, setState] = useState<JoinState>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [teamId, setTeamId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthReady) return;

    if (!code) {
      setErrorMsg('초대 코드가 없습니다');
      setState('error');
      return;
    }

    if (!hasAccessToken()) {
      router.replace(getLoginUrl(`/invite?code=${code}`));
      return;
    }

    setState('joining');

    joinTeam({ invite_code: code })
      .then((res) => {
        setTeamId(res.team_id);
        setState('success');
      })
      .catch((err) => {
        const status = err?.response?.status;
        const detail = err?.response?.data?.detail;

        if (status === 409 || detail?.includes('이미')) {
          const id = err?.response?.data?.team_id;
          if (id) setTeamId(id);
          setState('already');
        } else {
          setErrorMsg(
            detail || '초대 링크가 유효하지 않거나 만료되었습니다'
          );
          setState('error');
        }
      });
  }, [isAuthReady, code, router]);

  const goToTeam = () => {
    if (teamId) {
      router.replace(`/chinba/team/detail?id=${teamId}`);
    } else {
      router.replace('/chinba/team');
    }
  };

  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm text-center">
        {(state === 'loading' || state === 'joining') && (
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner />
            <p className="text-sm text-gray-500">팀에 참여하는 중...</p>
          </div>
        )}

        {state === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <span className="text-3xl">🎉</span>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">팀 참여 완료!</p>
              <p className="mt-1 text-sm text-gray-500">환영합니다</p>
            </div>
            <button
              onClick={goToTeam}
              className="w-full rounded-xl bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 active:scale-[0.98]"
            >
              팀으로 이동
            </button>
          </div>
        )}

        {state === 'already' && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <span className="text-3xl">👋</span>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">이미 참여한 팀이에요</p>
              <p className="mt-1 text-sm text-gray-500">바로 팀 페이지로 이동할게요</p>
            </div>
            <button
              onClick={goToTeam}
              className="w-full rounded-xl bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 active:scale-[0.98]"
            >
              팀으로 이동
            </button>
          </div>
        )}

        {state === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <span className="text-3xl">😢</span>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">참여할 수 없습니다</p>
              <p className="mt-1 text-sm text-gray-500">{errorMsg}</p>
            </div>
            <button
              onClick={() => router.replace('/')}
              className="w-full rounded-xl bg-gray-100 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 active:scale-[0.98]"
            >
              홈으로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
