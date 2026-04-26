'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiCalendar,
  FiChevronRight,
  FiClock,
  FiGrid,
  FiLink,
  FiPlus,
  FiUsers,
} from 'react-icons/fi';

import LoadingSpinner from '@/_components/ui/LoadingSpinner';
import TeamCard from '@/(main)/teams/_components/TeamCard';
import { useMyChinbaEvents } from '@/_lib/hooks/useChinba';
import { useMyTeams } from '@/_lib/hooks/useTeam';
import { useTeamStats } from '@/_lib/hooks/useTeamStats';
import { useUser } from '@/_lib/hooks/useUser';

import { ChinbaEventListItem } from './_components/ChinbaEventListItem';

const CONCEPTS = [
  {
    title: '시간표 기반',
    description: '내 수업 시간을 반영해서 비는 시간을 빠르게 찾습니다.',
    icon: FiClock,
  },
  {
    title: '링크 공유',
    description: '카톡방에 링크만 보내면 멤버가 바로 참여합니다.',
    icon: FiLink,
  },
  {
    title: '동아리 운영',
    description: '동아리 전체, 조별, 활동별로 일정을 따로 조율합니다.',
    icon: FiUsers,
  },
];

const USE_CASES = ['동아리 정기모임', '조별과제 회의', '스터디 시간', 'MT/회식 날짜'];

export default function ChinbaHomePage() {
  const router = useRouter();
  const { isAuthLoaded, isLoggedIn } = useUser();
  const { data: stats } = useTeamStats();
  const {
    data: events,
    isLoading: isEventsLoading,
  } = useMyChinbaEvents(isAuthLoaded && isLoggedIn);
  const {
    data: teamsData,
    isLoading: isTeamsLoading,
  } = useMyTeams();

  const visibleEvents = (events ?? []).slice(0, 3);
  const visibleTeams = (teamsData?.teams ?? []).slice(0, 3);
  const hasEvents = visibleEvents.length > 0;
  const hasTeams = visibleTeams.length > 0;

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="space-y-4 px-4 pt-4 pb-10">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold tracking-tight text-blue-700">친해지길 바래</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
          <h1 className="mt-2 text-xl font-bold leading-snug text-gray-900 break-keep">
            단톡방 투표 없이,
            <br />
            시간표로 바로 만나는 시간 찾기
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-500 break-keep">
            동아리 정모, 조별과제, 스터디 시간을 가장 빠르게 맞춰요.
          </p>
          {stats && (
            <p className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {stats.total_teams.toLocaleString('ko-KR')}개의 동아리가 함께하고 있어요
            </p>
          )}
        </section>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/chinba/create"
            className="rounded-2xl bg-gray-900 p-4 text-white shadow-sm transition active:scale-[0.99]"
          >
            <FiPlus size={20} />
            <p className="mt-3 text-sm font-bold">새 일정</p>
            <p className="mt-1 text-xs leading-relaxed text-white/60">링크로 빠르게 시간을 모아요.</p>
          </Link>
          <Link
            href="/chinba/team"
            className="rounded-2xl bg-white p-4 text-gray-900 shadow-sm transition active:scale-[0.99]"
          >
            <FiUsers size={20} />
            <p className="mt-3 text-sm font-bold">동아리</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">동아리와 조별 일정을 관리해요.</p>
          </Link>
        </div>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <FiGrid size={16} className="text-gray-500" />
            <h2 className="text-sm font-bold text-gray-900">친바가 하는 일</h2>
          </div>
          <div className="grid gap-2">
            {CONCEPTS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-3 rounded-xl bg-gray-50 px-3 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm">
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900">{item.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-500 break-keep">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <FiCalendar size={16} className="text-gray-500" />
            <h2 className="text-sm font-bold text-gray-900">이럴 때 써요</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {USE_CASES.map((label) => (
              <span
                key={label}
                className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
              >
                {label}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <SectionHeader
            title="내 친바 일정"
            href="/chinba/create"
            actionLabel="생성"
            icon={<FiPlus size={14} />}
          />
          {!isAuthLoaded || (isLoggedIn && isEventsLoading) ? (
            <LoadingBlock />
          ) : !isLoggedIn ? (
            <EmptyState
              title="로그인하면 내 일정을 모아볼 수 있어요"
              description="친바를 만들고 공유한 일정을 한 곳에서 관리하세요."
              actionLabel="로그인하기"
              onAction={() => router.push('/login?redirect=/chinba')}
            />
          ) : hasEvents ? (
            <div className="space-y-2">
              {visibleEvents.map((event) => (
                <ChinbaEventListItem
                  key={event.event_id}
                  event={event}
                  compact
                  onClick={() => router.push(`/chinba/event?id=${event.event_id}`)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="아직 참여 중인 친바가 없어요"
              description="새 일정을 만들어 단톡방에 공유해보세요."
              actionLabel="일정 만들기"
              onAction={() => router.push('/chinba/create')}
            />
          )}
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <SectionHeader title="내 동아리" href="/chinba/team" actionLabel="전체" />
          {!isAuthLoaded || (isLoggedIn && isTeamsLoading) ? (
            <LoadingBlock />
          ) : !isLoggedIn ? (
            <EmptyState
              title="동아리를 만들거나 초대 코드로 참여하세요"
              description="동아리 전체와 조별 친바를 한 곳에서 운영할 수 있어요."
              actionLabel="로그인하기"
              onAction={() => router.push('/login?redirect=/chinba/team')}
            />
          ) : hasTeams ? (
            <div className="space-y-2">
              {visibleTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  terminology="club"
                  onClick={() => router.push(`/chinba/team/detail?id=${team.id}`)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="아직 참여 중인 동아리가 없어요"
              description="새 동아리를 만들거나 받은 초대 코드로 참여하세요."
              actionLabel="동아리 시작하기"
              onAction={() => router.push('/chinba/team')}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  href,
  actionLabel,
  icon,
}: {
  title: string;
  href: string;
  actionLabel: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      <Link
        href={href}
        className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-200"
      >
        {icon}
        {actionLabel}
        {!icon && <FiChevronRight size={13} />}
      </Link>
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="sm" />
    </div>
  );
}

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-5 text-center">
      <p className="text-sm font-bold text-gray-700 break-keep">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-gray-400 break-keep">{description}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-3 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm transition active:scale-[0.98]"
      >
        {actionLabel}
      </button>
    </div>
  );
}
