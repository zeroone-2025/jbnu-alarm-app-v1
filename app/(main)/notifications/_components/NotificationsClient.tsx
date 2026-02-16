'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getKeywordNotices,
  getMyKeywords,
  markNoticeAsRead,
  toggleNoticeFavorite,
  Notice,
} from '@/_lib/api';
import Toast from '@/_components/ui/Toast';
import { getLoginUrl } from '@/_lib/utils/requireLogin';
import NoticeList from '@/(main)/(home)/_components/NoticeList';
import { usePullToRefresh } from '@/_lib/hooks/usePullToRefresh';
import FullPageModal from '@/_components/layout/FullPageModal';
import KeywordSettingsBar from '@/_components/ui/KeywordSettingsBar';
import PullToRefreshIndicator from '@/_components/ui/PullToRefreshIndicator';
import { useUser } from '@/_lib/hooks/useUser';

type LoadMode = 'initial' | 'refresh' | 'retry';

export default function NotificationsClient() {
  const router = useRouter();
  const { isLoggedIn } = useUser();
  const [keywordCount, setKeywordCount] = useState<number | null>(null);
  const [keywordNotices, setKeywordNotices] = useState<Notice[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [showToast, setShowToast] = useState(false);
  const [toastKey, setToastKey] = useState(0);
  const isLoggedInRef = useRef(isLoggedIn);
  const isInitialLoadingRef = useRef(false);
  const isRefreshingRef = useRef(false);

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastKey(prev => prev + 1);
    setShowToast(true);
  };

  useEffect(() => {
    isLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn]);

  const setInitialLoadingState = (value: boolean) => {
    isInitialLoadingRef.current = value;
    setIsInitialLoading(value);
  };

  const setRefreshingState = (value: boolean) => {
    isRefreshingRef.current = value;
    setIsRefreshing(value);
  };

  const loadNotifications = async ({ mode }: { mode: LoadMode }) => {
    if (!isLoggedInRef.current) return;
    if (isRefreshingRef.current || isInitialLoadingRef.current) return;

    const isInitialMode = mode === 'initial' || mode === 'retry';
    if (isInitialMode) {
      setInitialLoadingState(true);
    } else {
      setRefreshingState(true);
    }

    try {
      const keywords = await getMyKeywords();
      const count = keywords.length;
      setKeywordCount(count);

      if (count === 0) {
        setKeywordNotices([]);
        setLoadError(null);
        return;
      }

      const notices = await getKeywordNotices(0, 200, true);
      setKeywordNotices(notices);
      setLoadError(null);
    } catch (error) {
      console.error('Failed to load notifications', error);
      setLoadError('알림을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
      showToastMessage('알림을 불러오지 못했습니다.', 'error');
    } finally {
      if (isInitialMode) {
        setInitialLoadingState(false);
      } else {
        setRefreshingState(false);
      }
    }
  };

  // Pull to Refresh 훅
  const { scrollContainerRef, isPulling, pullDistance } = usePullToRefresh({
    onRefresh: async () => {
      await loadNotifications({ mode: 'refresh' });
    },
    enabled: isLoggedIn,
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

  const searchParams = useSearchParams();
  const lastSeenParam = searchParams.get('last_seen');

  const highlightedIds = useMemo(() => {
    if (!lastSeenParam || keywordNotices.length === 0) return [];
    try {
      const lastSeenTime = new Date(lastSeenParam).getTime();
      const ids = keywordNotices
        .filter(notice => {
          // created_at이 있으면 우선 사용, 없으면 date 사용
          const noticeTime = new Date(notice.created_at || notice.date).getTime();
          // 기준 시점(마지막으로 확인한 시점)보다 나중에 올라온 공지만 강조
          return noticeTime > lastSeenTime;
        })
        .map(notice => notice.id);
      return ids;
    } catch (e) {
      return [];
    }
  }, [keywordNotices, lastSeenParam]);

  useEffect(() => {
    if (!isLoggedIn) {
      setKeywordCount(null);
      setKeywordNotices([]);
      setLoadError(null);
      setInitialLoadingState(false);
      setRefreshingState(false);
      return;
    }

    loadNotifications({ mode: 'initial' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const isErrorWithoutData = !!loadError && keywordNotices.length === 0;
  const keywordCountLabel = keywordCount ?? 0;
  const emptyMessage = isErrorWithoutData
    ? loadError
    : keywordCountLabel === 0
      ? '키워드를 등록하면 알림을 받을 수 있어요'
      : '아직 받은 알림이 없어요';
  const emptyDescription = isErrorWithoutData
    ? '네트워크 상태를 확인한 뒤 다시 시도해 주세요'
    : keywordCountLabel === 0
      ? '상단 설정 버튼에서 키워드를 추가해 주세요'
      : '새로운 알림이 오면 여기에 표시돼요';
  const emptyActionLabel = isErrorWithoutData
    ? '다시 시도'
    : keywordCountLabel === 0
      ? '키워드 설정하기'
      : undefined;

  const handleEmptyActionClick = () => {
    if (isErrorWithoutData) {
      loadNotifications({ mode: 'retry' });
      return;
    }

    if (keywordCountLabel === 0) {
      router.push('/keywords');
    }
  };

  return (
    <>
      <FullPageModal isOpen={true} onClose={() => router.back()} title="알림">
        <KeywordSettingsBar
          keywordCount={keywordCountLabel}
          onSettingsClick={() => {
            if (!isLoggedIn) {
              showToastMessage('로그인 후 키워드 설정을 사용할 수 있습니다.', 'info');
              return;
            }
            router.push('/keywords');
          }}
        />

        <PullToRefreshIndicator
          isPulling={isPulling}
          pullDistance={pullDistance}
          refreshing={isRefreshing}
        />

        {!isLoggedIn ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
            <p className="mb-6 text-sm font-medium text-gray-700">로그인하면 알림을 받을 수 있어요.</p>
            <div className="w-full max-w-xs">
              <button
                onClick={() => router.push(getLoginUrl())}
                className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 active:bg-gray-700"
              >
                로그인하기
              </button>
            </div>
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
                loading={isInitialLoading}
                selectedCategories={['keyword']}
                filteredNotices={keywordNotices}
                showKeywordPrefix={true}
                onMarkAsRead={handleMarkAsRead}
                onToggleFavorite={handleToggleFavorite}
                isLoggedIn={isLoggedIn}
                emptyMessage={emptyMessage}
                emptyDescription={emptyDescription}
                emptyActionLabel={emptyActionLabel}
                onEmptyActionClick={emptyActionLabel ? handleEmptyActionClick : undefined}
                emptyStateVariant={isErrorWithoutData ? 'error' : keywordCountLabel === 0 ? 'keyword' : 'default'}
                highlightedIds={highlightedIds}
              />
            </div>
          </div>
        )}
      </FullPageModal>

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
        triggerKey={toastKey}
      />
    </>
  );
}
