'use client';

import { useRouter } from 'next/navigation';
import { FiPlus, FiUsers } from 'react-icons/fi';
import { LuChevronLeft } from 'react-icons/lu';
import { useMyChinbaEvents } from '@/_lib/hooks/useChinba';
import { useUser } from '@/_lib/hooks/useUser';
import LoadingSpinner from '@/_components/ui/LoadingSpinner';
import Toast from '@/_components/ui/Toast';
import { ChinbaEventListItem } from './ChinbaEventListItem';
import { useState } from 'react';


export default function ChinbaHistoryClient() {
  const router = useRouter();
  const { isLoggedIn, isAuthLoaded } = useUser();
  const { data: events, isLoading } = useMyChinbaEvents(isLoggedIn);
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
                <ChinbaEventListItem
                  key={event.event_id}
                  event={event}
                  onClick={() => router.push(`/chinba/event?id=${event.event_id}`)}
                />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleCreateClick}
          className="absolute bottom-8 right-8 z-[60] h-14 w-14 rounded-full bg-gray-900 text-white shadow-xl flex items-center justify-center active:scale-95 transition-all"
          aria-label="새로 만들기"
        >
          <FiPlus size={24} />
        </button>
      </div>

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
