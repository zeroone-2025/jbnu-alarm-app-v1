'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getKeywordNotices,
  getMyKeywords,
  markNoticeAsRead,
  toggleNoticeFavorite,
  Notice,
} from '@/_lib/api';
import Toast from '@/_components/ui/Toast';
import GoogleLoginButton from '@/_components/auth/GoogleLoginButton';
import NoticeList from '@/(routes)/(home)/_components/NoticeList';
import { usePullToRefresh } from '@/_lib/hooks/usePullToRefresh';
import FullPageModal from '@/_components/layout/FullPageModal';
import KeywordSettingsBar from '@/_components/ui/KeywordSettingsBar';

function NotificationsClient() {
  const router = useRouter();
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
      showToastMessage('알림을 불러오지 못했습니다.', 'error');
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


  const keywordCountLabel = keywordCount ?? 0;

  return (
    <>
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />

      <FullPageModal isOpen={true} onClose={() => router.push('/')} title="알림">
        <KeywordSettingsBar
          keywordCount={keywordCountLabel}
          onSettingsClick={() =>
            router.push('/keywords')
          }
        />

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
            <div className="w-6 h-6 border-2 border-gray-900 rounded-full animate-spin border-t-transparent"></div>
          ) : isPulling && pullDistance > 0 ? (
            <div
              className="text-sm font-medium text-gray-600"
              style={{
                transform: `scale(${Math.min(pullDistance / 40, 1)})`,
              }}
            >
              {pullDistance > 30 ? '↓ 놓아서 새로고침' : '↓ 당겨서 새로고침'}
            </div>
          ) : null}
        </div>

        {!isLoggedIn ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
            <GoogleLoginButton />
            <p className="mt-4 text-sm text-gray-600">로그인하면 알림을 받을 수 있어요.</p>
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
                    ? '키워드를 등록하면 알림을 받을 수 있어요'
                    : '아직 받은 알림이 없어요'
                }
                emptyDescription={
                  keywordCountLabel === 0
                    ? '상단 설정 버튼에서 키워드를 추가해 주세요'
                    : '새로운 알림이 오면 여기에 표시돼요'
                }
              />
            </div>
          </div>
        )}
      </FullPageModal>
    </>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      }
    >
      <NotificationsClient />
    </Suspense>
  );
}
