'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiArrowLeft, FiSettings } from 'react-icons/fi';
import {
  getKeywordNotices,
  getGoogleLoginUrl,
  getMyKeywords,
  markNoticeAsRead,
  toggleNoticeFavorite,
  Notice,
} from '@/api';
import Toast from '@/components/Toast';
import NoticeList from '@/(home)/components/NoticeList';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

function KeywordNotificationsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [keywordCount, setKeywordCount] = useState<number | null>(null);
  const [keywordNotices, setKeywordNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [showToast, setShowToast] = useState(false);

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const loadKeywordCount = async () => {
    try {
      const data = await getMyKeywords();
      const count = data.length;
      setKeywordCount(count);
      return count;
    } catch (error) {
      console.error('Failed to load keywords', error);
      setKeywordCount(0);
      return 0;
    }
  };

  const loadKeywordNotices = async () => {
    setLoading(true);
    try {
      const data = await getKeywordNotices(0, 200, true);
      setKeywordNotices(data);
    } catch (error) {
      console.error('Failed to load keyword notices', error);
      showToastMessage('키워드 알림을 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const refreshKeywordNotices = async () => {
    if (!isLoggedIn) return;
    const count = await loadKeywordCount();
    if (count === 0) {
      setKeywordNotices([]);
      return;
    }
    await loadKeywordNotices();
  };

  // Pull to Refresh 훅
  const { scrollContainerRef, isPulling, pullDistance, refreshing } = usePullToRefresh({
    onRefresh: refreshKeywordNotices,
    enabled: true, // 항상 활성화 (키워드 있으면 공지 없어도 새로고침 가능)
  });

  const updateNoticeState = (
    noticeId: number,
    updater: (notice: Notice) => Notice,
  ) => {
    setKeywordNotices((prevNotices) =>
      prevNotices.map((notice) => (notice.id === noticeId ? updater(notice) : notice)),
    );
  };

  const handleMarkAsRead = async (noticeId: number) => {
    if (!isLoggedIn) {
      return;
    }
    updateNoticeState(noticeId, (notice) => ({ ...notice, is_read: true }));
    try {
      await markNoticeAsRead(noticeId);
    } catch (error) {
      console.error('Failed to mark notice as read:', error);
      updateNoticeState(noticeId, (notice) => ({ ...notice, is_read: false }));
    }
  };

  const handleToggleFavorite = async (noticeId: number) => {
    if (!isLoggedIn) {
      showToastMessage('로그인 후 사용할 수 있는 기능입니다.', 'info');
      return;
    }
    updateNoticeState(noticeId, (notice) => ({ ...notice, is_favorite: !notice.is_favorite }));
    try {
      await toggleNoticeFavorite(noticeId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      updateNoticeState(noticeId, (notice) => ({ ...notice, is_favorite: !notice.is_favorite }));
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const loggedIn = !!token;
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      (async () => {
        const count = await loadKeywordCount();
        if (count === 0) {
          setKeywordNotices([]);
          return;
        }
        await loadKeywordNotices();
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const returnTo = searchParams.get('returnTo') ?? '/';
  const keywordCountLabel = keywordCount ?? 0;

  return (
    <>
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />

      <main className="h-full overflow-hidden bg-gray-50">
        <div className="relative flex h-full w-full max-w-md flex-col overflow-hidden border-x border-gray-100 bg-white shadow-xl transition-all md:max-w-4xl">
          <div className="shrink-0 border-b border-gray-100 px-5 py-4" style={{ touchAction: 'none' }}>
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push(returnTo)}
                className="rounded-full p-2 text-gray-600 transition-all hover:bg-gray-100"
                aria-label="홈으로 돌아가기"
              >
                <FiArrowLeft size={20} />
              </button>
              <h1 className="text-lg font-bold text-gray-800">키워드 알림</h1>
              <div className="w-10" />
            </div>
          </div>

          <div className="shrink-0 border-b border-gray-100 bg-white px-5 py-3" style={{ touchAction: 'none' }}>
            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <span className="text-sm font-medium text-gray-700">
                알림 받는 키워드 {keywordCountLabel}개
              </span>
              <button
                onClick={() =>
                  router.push(`/keywords?returnTo=${encodeURIComponent('/notifications/keyword')}`)
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-100"
                aria-label="키워드 설정"
              >
                <FiSettings size={16} />
                설정
              </button>
            </div>
          </div>

          {/* Pull to Refresh 인디케이터 */}
          <div
            className="shrink-0 flex items-center justify-center bg-linear-to-b from-gray-50 to-transparent overflow-hidden"
            style={{
              height: refreshing ? '64px' : isPulling ? `${pullDistance}px` : '0px',
              opacity: refreshing ? 1 : isPulling ? Math.min(pullDistance / 50, 1) : 0,
              transition: (isPulling || refreshing) ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-out',
            }}
          >
            {refreshing ? (
              <div className="w-6 h-6 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
            ) : (
              <div
                className="text-sm font-medium text-gray-600"
                style={{
                  transform: `scale(${Math.min(pullDistance / 40, 1)})`,
                  transition: 'transform 0.1s ease-out',
                }}
              >
                {pullDistance > 30 ? '↓ 놓아서 새로고침' : '↓ 당겨서 새로고침'}
              </div>
            )}
          </div>

          {!isLoggedIn ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <p className="text-sm text-gray-600">로그인하면 키워드 알림을 받을 수 있어요.</p>
              <button
                onClick={() => (window.location.href = getGoogleLoginUrl())}
                className="mt-4 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Google 계정으로 로그인
              </button>
            </div>
          ) : (
            <div className="relative flex-1 min-h-0 overflow-hidden">
              <div
                ref={scrollContainerRef as React.RefObject<HTMLDivElement>}
                className="h-full overflow-y-auto"
                style={{
                  touchAction: 'pan-y',
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                }}
              >
                <NoticeList
                  loading={loading}
                  selectedCategories={['keyword']}
                  filteredNotices={keywordNotices}
                  showKeywordPrefix={true}
                  onMarkAsRead={handleMarkAsRead}
                  onToggleFavorite={handleToggleFavorite}
                  isLoggedIn={isLoggedIn}
                  emptyMessage={
                    keywordCountLabel === 0
                      ? '키워드를 등록하면 관련 공지가 모여요'
                      : '아직 키워드에 맞는 공지사항이 없어요'
                  }
                  emptyDescription={
                    keywordCountLabel === 0
                      ? '키워드를 추가해 주세요'
                      : '새 공지가 올라오면 여기에 표시돼요'
                  }
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default function KeywordNotificationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      }
    >
      <KeywordNotificationsClient />
    </Suspense>
  );
}
