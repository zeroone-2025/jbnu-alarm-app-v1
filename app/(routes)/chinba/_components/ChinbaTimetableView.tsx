'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus } from 'react-icons/fi';
import { TimetableTab } from '@/_components/timetable';
import { useUser } from '@/_lib/hooks/useUser';
import { useMyChinbaEvents } from '@/_lib/hooks/useChinba';
import LoadingSpinner from '@/_components/ui/LoadingSpinner';
import Sidebar from '@/_components/layout/Sidebar';
import Toast from '@/_components/ui/Toast';
import { ChinbaEventList } from './ChinbaEventList';
import { ChinbaHeader } from './ChinbaHeader';

export default function ChinbaTimetableView() {
  const router = useRouter();
  const { isAuthLoaded, isLoggedIn } = useUser();
  const { data: chinbaEvents, isLoading: isLoadingChinbaEvents, refetch } = useMyChinbaEvents(isLoggedIn);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [toastKey, setToastKey] = useState(0);

  const handleShowToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastKey(prev => prev + 1);
    setShowToast(true);
  };

  if (!isAuthLoaded) {
    return (
      <div className="flex h-60 items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-50">
      <div className="relative mx-auto flex h-full w-full max-w-md flex-col border-x border-gray-100 bg-white shadow-xl md:max-w-4xl">
        {/* Header */}
        <ChinbaHeader onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Chinba Event List - 로그인 상태이고 이벤트가 있을 때만 표시 */}
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
                        onShowToast={handleShowToast}
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
                친바를 생성하세요 ✨
              </button>
            )}
          </div>
        )}

        {/* Timetable Content - flex-1로 전체 높이 차지 */}
        <div className="flex-1 overflow-hidden">
          <TimetableTab />
        </div>

        {/* Floating + Button */}
        <button
          onClick={() => router.push('/chinba/create')}
          className="absolute bottom-8 right-8 z-[60] h-14 w-14 rounded-full bg-gray-900 text-white shadow-xl flex items-center justify-center active:scale-95 transition-all"
          aria-label="새로 만들기"
        >
          <FiPlus size={24} />
        </button>

        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onShowToast={handleShowToast} />
      </div>

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
        triggerKey={toastKey}
      />
    </div>
  );
}
