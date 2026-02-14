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
    <div className="relative flex flex-col h-full">
      {/* Chinba Event List */}
      {isLoggedIn && (
        <div className="shrink-0 px-4 pb-3 border-b border-gray-100">
          {chinbaEvents && chinbaEvents.length > 0 ? (
            <div>
              <h2 className="text-xs font-semibold text-gray-600 mb-2">내 친바 일정</h2>
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
            </div>
          ) : isLoadingChinbaEvents ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <button
              onClick={() => router.push('/chinba/create')}
              className="w-full py-4 px-4 text-center text-sm text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors active:scale-[0.99]"
            >
              친바를 생성하세요
            </button>
          )}
        </div>
      )}

      {/* Timetable Content */}
      <div className="flex-1 overflow-hidden">
        <TimetableTab />
      </div>

      {/* Floating + Button */}
      <button
        onClick={() => router.push('/chinba/create')}
        className="absolute bottom-8 right-8 z-10 h-14 w-14 rounded-full bg-gray-900 text-white shadow-xl flex items-center justify-center active:scale-95 transition-all"
        aria-label="새로 만들기"
      >
        <FiPlus size={24} />
      </button>
    </div>
  );
}
