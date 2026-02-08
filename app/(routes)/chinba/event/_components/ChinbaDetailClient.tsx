'use client';

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiShare2, FiTrash2, FiCheckCircle, FiLink } from 'react-icons/fi';
import { LuChevronLeft } from 'react-icons/lu';
import LoadingSpinner from '@/_components/ui/LoadingSpinner';
import ConfirmModal from '@/_components/ui/ConfirmModal';
import Toast from '@/_components/ui/Toast';
import { useUser } from '@/_lib/hooks/useUser';
import { useChinbaEventDetail, useDeleteChinbaEvent, useCompleteChinbaEvent } from '@/_lib/hooks/useChinba';
import TeamScheduleTab from './TeamScheduleTab';
import MyScheduleTab from './MyScheduleTab';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function formatDateRange(dates: string[]): string {
  if (dates.length === 0) return '';
  return dates.map((d) => {
    const dt = new Date(d);
    return `${dt.getMonth() + 1}/${dt.getDate()}(${DAY_LABELS[dt.getDay()]})`;
  }).join(', ');
}

export default function ChinbaDetailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get('id') || '';

  const { user, isLoggedIn, isAuthLoaded } = useUser();
  const { data: event, isLoading, error } = useChinbaEventDetail(eventId);
  const deleteMutation = useDeleteChinbaEvent();
  const completeMutation = useCompleteChinbaEvent();

  const [activeTab, setActiveTab] = useState<'team' | 'my'>('team');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastKey, setToastKey] = useState(0);

  const isCreator = isLoggedIn && user && event && user.id === event.creator_id;
  const isActive = event?.status === 'active';
  const isCompleted = event?.status === 'completed';
  const isExpired = event?.status === 'expired';

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const text = `${event?.title || '일정 조율'}에 참여하세요!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: event?.title, text, url });
      } catch {
        // cancelled
      }
    } else {
      // share 미지원 시 복사로 폴백
      await navigator.clipboard.writeText(url);
      setToastMessage('링크가 복사되었습니다');
      setToastVisible(true);
      setToastKey(prev => prev + 1);
    }
  }, [event?.title]);

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(window.location.href);
    setToastMessage('링크가 복사되었습니다');
    setToastVisible(true);
    setToastKey(prev => prev + 1);
  }, []);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(eventId);
      router.replace('/chinba');
    } catch {
      alert('삭제에 실패했습니다');
    }
    setShowDeleteModal(false);
  };

  const handleComplete = async () => {
    try {
      await completeMutation.mutateAsync(eventId);
    } catch {
      alert('완료 처리에 실패했습니다');
    }
    setShowCompleteModal(false);
  };

  // Loading state
  if (!isAuthLoaded || isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50">
        <div className="relative mx-auto flex h-full w-full max-w-md items-center justify-center border-x border-gray-100 bg-white shadow-xl md:max-w-4xl">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50">
        <div className="relative mx-auto flex h-full w-full max-w-md flex-col items-center justify-center border-x border-gray-100 bg-white shadow-xl md:max-w-4xl">
          <p className="text-sm text-gray-500">이벤트를 찾을 수 없습니다</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-50">
      <div className="relative mx-auto flex h-full w-full max-w-md flex-col border-x border-gray-100 bg-white shadow-xl md:max-w-4xl">
        {/* Sticky Header */}
        <div className="shrink-0 px-4 pb-2 border-b border-gray-100">
          <div className="pt-safe" />
          <div className="relative mt-4 flex items-center justify-between md:mt-4">
            <button
              onClick={() => router.push('/chinba')}
              className="z-10 group -ml-1 rounded-full p-2 text-gray-600 transition-all hover:bg-gray-100 active:scale-95"
            >
              <LuChevronLeft size={24} strokeWidth={2.5} />
            </button>

            <div className="flex-1 text-center mx-2">
              <h1 className="text-sm font-bold text-gray-800 truncate">{event.title}</h1>
              <p className="text-[10px] text-gray-400 mt-0.5">{formatDateRange(event.dates)}</p>
            </div>

            <div className="flex items-center gap-1">
              {isCreator && isActive && (
                <button
                  onClick={() => setShowCompleteModal(true)}
                  className="rounded-full p-2 text-emerald-600 hover:bg-emerald-50 transition-colors"
                  title="완료 처리"
                >
                  <FiCheckCircle size={18} />
                </button>
              )}
              <button
                onClick={handleCopyLink}
                className="rounded-full p-2 text-gray-600 hover:bg-gray-100 transition-colors"
                title="링크 복사"
              >
                <FiLink size={17} />
              </button>
              <button
                onClick={handleShare}
                className="rounded-full p-2 text-gray-600 hover:bg-gray-100 transition-colors"
                title="공유"
              >
                <FiShare2 size={18} />
              </button>
              {isCreator && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="rounded-full p-2 text-red-500 hover:bg-red-50 transition-colors"
                >
                  <FiTrash2 size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Banner */}
        {isCompleted && (
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100">
            <p className="text-xs text-emerald-700 text-center font-medium">완료된 일정입니다</p>
          </div>
        )}
        {isExpired && (
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-500 text-center font-medium">만료된 일정입니다</p>
          </div>
        )}

        {/* Tabs (only show if active) */}
        {isActive && (
          <div className="shrink-0 flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('team')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'team'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-400'
              }`}
            >
              전체 일정
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'my'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-400'
              }`}
            >
              내 일정
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pt-4 pb-safe">
          {(isCompleted || isExpired || activeTab === 'team') && (
            <TeamScheduleTab event={event} />
          )}
          {isActive && activeTab === 'my' && (
            <MyScheduleTab
              eventId={eventId}
              dates={event.dates}
              startHour={event.start_hour}
              endHour={event.end_hour}
              isLoggedIn={isLoggedIn}
            />
          )}
        </div>
      </div>

      {/* Copy toast */}
      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        duration={2000}
        triggerKey={toastKey}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        variant="danger"
        confirmLabel="삭제"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      >
        이 일정을 삭제하시겠습니까?
        <br />
        <span className="text-xs text-gray-400">모든 참여자의 데이터가 삭제됩니다</span>
      </ConfirmModal>

      {/* Complete Modal */}
      <ConfirmModal
        isOpen={showCompleteModal}
        confirmLabel="완료"
        onConfirm={handleComplete}
        onCancel={() => setShowCompleteModal(false)}
      >
        이 일정을 완료 처리하시겠습니까?
        <br />
        <span className="text-xs text-gray-400">완료 후에는 일정 수정이 불가합니다</span>
      </ConfirmModal>
    </div>
  );
}
