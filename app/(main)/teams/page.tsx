'use client';

import { useRouter } from 'next/navigation';
import { FiPlus, FiUsers } from 'react-icons/fi';

import LoadingSpinner from '@/_components/ui/LoadingSpinner';
import { useMyTeams } from '@/_lib/hooks/useTeam';

import TeamCard from './_components/TeamCard';

export default function TeamsPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useMyTeams();

  const teams = data?.teams ?? [];

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="shrink-0 px-4 pb-3">
        <div className="pt-safe md:pt-0" />
        <div className="relative mt-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">내 팀</h1>
          <button
            onClick={() => router.push('/teams/create')}
            className="flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800 active:scale-95"
          >
            <FiPlus size={14} />
            만들기
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-sm text-gray-400">팀 목록을 불러오지 못했습니다</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
            >
              다시 시도
            </button>
          </div>
        ) : teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
              <FiUsers size={28} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">팀이 없습니다</p>
            <p className="text-xs text-gray-400 text-center">
              새 팀을 만들거나 초대 링크로 가입하세요
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onClick={() => router.push(`/teams/detail?id=${team.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
