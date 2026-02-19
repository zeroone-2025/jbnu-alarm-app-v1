'use client';

import { useRouter } from 'next/navigation';
import { FiPlus } from 'react-icons/fi';
import { TimetableTab } from '@/_components/timetable';
import { useUser } from '@/_lib/hooks/useUser';
import { useMyChinbaEvents } from '@/_lib/hooks/useChinba';
import LoadingSpinner from '@/_components/ui/LoadingSpinner';
import { useToast } from '@/_context/ToastContext';
import { ChinbaEventList } from './ChinbaEventList';

export default function ChinbaTimetableView() {
  const router = useRouter();
  const { showToast } = useToast();
  const { isAuthLoaded, isLoggedIn } = useUser();
  const { data: chinbaEvents, isLoading: isLoadingChinbaEvents, refetch } = useMyChinbaEvents(isLoggedIn);

  if (!isAuthLoaded) {
    return (
      <div className="flex h-60 items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chinba Event List */}
      <div className="shrink-0 px-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-gray-600">내 친바 일정</h2>
          <button
            onClick={() => router.push('/chinba/create')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors active:scale-95"
          >
            <FiPlus size={14} />
            생성
          </button>
        </div>
        {isLoggedIn && chinbaEvents && chinbaEvents.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
            {chinbaEvents.map((event) => (
              <div key={event.event_id} className="w-[280px] shrink-0 snap-start">
                <ChinbaEventList
                  events={[event]}
                  isLoading={false}
                  onEventClick={(eventId) => router.push(`/chinba/event?id=${eventId}`)}
                  onDeleteSuccess={refetch}
                  onShowToast={showToast}
                />
              </div>
            ))}
          </div>
        ) : isLoggedIn && isLoadingChinbaEvents ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400 py-4">
            아직 참여 중인 친바가 없어요
          </p>
        )}
      </div>

      {/* Timetable Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="shrink-0 px-4 pt-3 pb-2">
          <h2 className="text-xs font-semibold text-gray-600">내 시간표 관리</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <TimetableTab />
        </div>
      </div>
    </div>
  );
}
