'use client';

import { useRouter } from 'next/navigation';
import { FiPlus, FiUsers } from 'react-icons/fi';
import { TimetableTab } from '@/_components/timetable';
import { useUser } from '@/_lib/hooks/useUser';
import { useMyChinbaEvents } from '@/_lib/hooks/useChinba';
import LoadingSpinner from '@/_components/ui/LoadingSpinner';
import { useToast } from '@/_context/ToastContext';
import { ChinbaEventList } from './ChinbaEventList';
import BottomSheet from '@/_components/layout/BottomSheet';

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
      {/* Chinba Event List Header */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800">내 친바 일정</h2>
          <button
            onClick={() => router.push('/chinba/create')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-full transition-colors active:scale-95"
          >
            <FiPlus size={14} />
            생성
          </button>
        </div>
      </div>

      {/* Chinba Event List (vertical, dominant) */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4">
        {isLoggedIn && chinbaEvents && chinbaEvents.length > 0 ? (
          <ChinbaEventList
            events={chinbaEvents}
            isLoading={false}
            onEventClick={(eventId) => router.push(`/chinba/event?id=${eventId}`)}
            onDeleteSuccess={refetch}
            onShowToast={showToast}
            className="flex flex-col gap-3 pb-4"
          />
        ) : isLoggedIn && isLoadingChinbaEvents ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="sm" />
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FiUsers size={28} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400 mb-1">아직 참여 중인 친바가 없어요</p>
            <p className="text-xs text-gray-300">위의 생성 버튼을 눌러 시작하세요</p>
          </div>
        )}
      </div>

      {/* Timetable Bottom Sheet */}
      <BottomSheet title="내 시간표 관리">
        <TimetableTab />
      </BottomSheet>
    </div>
  );
}
