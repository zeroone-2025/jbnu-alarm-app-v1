'use client';

import { useRouter } from 'next/navigation';
import { FiPlus, FiCheck, FiUsers } from 'react-icons/fi';
import { LuChevronLeft } from 'react-icons/lu';
import { useMyChinbaEvents } from '@/_lib/hooks/useChinba';
import { useUser } from '@/_lib/hooks/useUser';
import LoadingSpinner from '@/_components/ui/LoadingSpinner';
import Toast from '@/_components/ui/Toast';
import type { ChinbaEventListItem } from '@/_types/chinba';
import { useState } from 'react';

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  active: { label: '진행중', className: 'bg-blue-100 text-blue-700' },
  completed: { label: '완료', className: 'bg-emerald-100 text-emerald-700' },
  expired: { label: '만료', className: 'bg-gray-100 text-gray-500' },
};

function formatDates(dates: string[]): string {
  if (dates.length <= 2) {
    return dates.map((d) => {
      const dt = new Date(d);
      return `${dt.getMonth() + 1}/${dt.getDate()}`;
    }).join(', ');
  }
  const first = new Date(dates[0]);
  const last = new Date(dates[dates.length - 1]);
  return `${first.getMonth() + 1}/${first.getDate()} ~ ${last.getMonth() + 1}/${last.getDate()} (${dates.length}일)`;
}

function EventCard({ event, onClick }: { event: ChinbaEventListItem; onClick: () => void }) {
  const badge = STATUS_BADGE[event.status] || STATUS_BADGE.active;
  const isExpired = event.status === 'expired';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all active:scale-[0.98] ${
        isExpired
          ? 'border-gray-100 bg-gray-50/50 opacity-60'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-800 truncate flex-1 mr-2">
          {event.title}
        </h3>
        <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-2">
        {formatDates(event.dates)}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <FiUsers size={12} />
          <span>제출 {event.submitted_count}/{event.participant_count}</span>
        </div>
        {event.my_submitted ? (
          <div className="flex items-center gap-1 text-xs text-emerald-600">
            <FiCheck size={12} />
            <span>제출완료</span>
          </div>
        ) : (
          <span className="text-xs text-amber-600">미제출</span>
        )}
      </div>

      {event.creator_nickname && (
        <p className="mt-1.5 text-[10px] text-gray-400">
          만든이: {event.creator_nickname}
        </p>
      )}
    </button>
  );
}

export default function ChinbaHistoryClient() {
  const router = useRouter();
  const { isLoggedIn, isAuthLoaded } = useUser();
  const { data: events, isLoading } = useMyChinbaEvents();
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastKey, setToastKey] = useState(0);

  if (!isAuthLoaded) {
    return (
      <div className="flex h-60 items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  const handleCreateClick = () => {
    router.push('/chinba/create');
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50">
      <div className="relative mx-auto flex h-full w-full max-w-md flex-col border-x border-gray-100 bg-white shadow-xl md:max-w-4xl">
        {/* Header */}
        <div className="shrink-0 px-4 pb-3">
          <div className="pt-safe" />
          <div className="relative mt-4 flex items-center justify-center md:mt-4">
            <button
              onClick={() => router.push('/')}
              className="absolute left-0 z-10 group -ml-1 rounded-full p-2 text-gray-600 transition-all hover:bg-gray-100 active:scale-95"
            >
              <LuChevronLeft size={24} strokeWidth={2.5} />
            </button>
            <h1 className="text-base font-bold text-gray-800">친해지길 바래</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-safe">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : !events || events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FiUsers size={28} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 mb-1">아직 참여한 일정이 없습니다</p>
              <p className="text-xs text-gray-300">우측 아래 + 버튼을 눌러 시작하세요</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2 pb-4">
              {events.map((event) => (
                <EventCard
                  key={event.event_id}
                  event={event}
                  onClick={() => router.push(`/chinba/event?id=${event.event_id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleCreateClick}
        className="fixed bottom-6 right-6 z-[60] h-12 w-12 rounded-full bg-gray-900 text-white shadow-lg flex items-center justify-center active:scale-95 transition-all"
        aria-label="새로 만들기"
      >
        <FiPlus size={20} />
      </button>

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        duration={2000}
        triggerKey={toastKey}
      />
    </div>
  );
}
