'use client';

import { Suspense, useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { fetchNoticesInfinite, Notice } from '@/_lib/api';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import relativeTime from 'dayjs/plugin/relativeTime';
import Toast from '@/_components/ui/Toast';
import { useSelectedCategories } from '@/_lib/hooks/useSelectedCategories';
import { usePullToRefresh } from '@/_lib/hooks/usePullToRefresh';
import { useAuthState } from '@/_lib/hooks/useAuthState';
import { useFilterState } from './_hooks/useFilterState';
import { useKeywordNotices } from './_hooks/useKeywordNotices';
import { useNoticeActions } from './_hooks/useNoticeActions';
import { useNoticeFiltering } from './_hooks/useNoticeFiltering';
import OnboardingModal from './_components/OnboardingModal';
import NoticeList from './_components/NoticeList';
import HomeHeader from './_components/HomeHeader';
import Sidebar from '@/_components/layout/Sidebar';
import CategoryFilter from '@/_components/ui/CategoryFilter';
import BoardFilterModal from './_components/BoardFilterModal';
import KeywordSettingsBar from '@/_components/ui/KeywordSettingsBar';

// Dayjs 설정
dayjs.extend(relativeTime);
dayjs.locale('ko');


function HomeContent() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showBoardFilterModal, setShowBoardFilterModal] = useState(false);

  // 클라이언트 마운트 체크
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Custom Hooks
  const { isLoggedIn, isAuthLoaded, checkAuthState } = useAuthState();
  const {
    selectedCategories,
    updateSelectedCategories,
    isLoading: isCategoriesLoading
  } = useSelectedCategories();

  // 쿼리 준비 상태 추적
  const [isQueryReady, setIsQueryReady] = useState(false);

  // 모든 의존성이 준비되면 쿼리 활성화
  useEffect(() => {
    // isAuthLoaded, selectedCategories, 마운트가 모두 완료되면 활성화
    if (isMounted && isAuthLoaded && !isCategoriesLoading && selectedCategories.length > 0) {
      setIsQueryReady(true);
    }
  }, [isMounted, isAuthLoaded, isCategoriesLoading, selectedCategories.length]);

  // Pull to Refresh용 스크롤 컨테이너 ref 초기화
  const { scrollContainerRef, isPulling, pullDistance, refreshing } = usePullToRefresh({
    onRefresh: async () => {
      if (filter === 'KEYWORD') {
        const count = await loadKeywordCount();
        if (count === 0) {
          setKeywordNotices([]);
          return;
        }
        await loadKeywordNotices();
        return;
      }
      await refetch();
    },
    enabled: true,
  });

  const { filter, setFilter } = useFilterState({
    isLoggedIn,
    isAuthLoaded,
    isMounted,
    scrollContainerRef,
  });

  const {
    keywordNotices,
    keywordCount,
    hasNewKeywordNotices,
    loadKeywordNotices,
    loadKeywordNoticesSilent,
    loadKeywordCount,
    markKeywordNoticesSeen,
    setKeywordNotices,
  } = useKeywordNotices(isLoggedIn, filter);

  // 게시판 목록
  const selectedBoards = selectedCategories;
  const selectedBoardsParam = useMemo(
    () => (selectedBoards.length > 0 ? [...selectedBoards].sort().join(',') : undefined),
    [selectedBoards],
  );

  // 무한 스크롤 쿼리
  const isFavoriteFilter = filter === 'FAVORITE';
  const {
    data: noticePages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    // queryKey에서 동적으로 변하는 값들 제거
    queryKey: ['notices', 'infinite', selectedBoardsParam],
    queryFn: ({ pageParam }) => fetchNoticesInfinite(
      pageParam,
      20,
      true,
      selectedBoards,
      isFavoriteFilter
    ),
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    initialPageParam: null as string | null,
    // 모든 의존성이 준비될 때까지 대기
    enabled: isQueryReady,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // 모든 페이지의 공지사항을 하나의 배열로 합치기
  const notices = useMemo<Notice[]>(() => {
    const pages = noticePages?.pages;
    if (!Array.isArray(pages)) return [];
    return pages.flatMap((page) =>
      Array.isArray(page?.items) ? page.items : [],
    );
  }, [noticePages]);

  // 공지사항 액션
  const { handleMarkAsRead, handleToggleFavorite } = useNoticeActions(
    isLoggedIn,
    setKeywordNotices
  );

  // 공지사항 필터링
  const { filteredNotices } = useNoticeFiltering(
    notices,
    keywordNotices,
    selectedBoards,
    isLoggedIn,
    filter
  );

  // Intersection Observer로 스크롤 끝 감지
  const { ref: loadMoreRef, inView } = useInView({
    rootMargin: '500px 0px 0px 0px',
    threshold: 0,
  });

  // 중복 요청 방지를 위한 ref
  const fetchingRef = useRef(false);

  // 스크롤이 끝에 가까워지면 다음 페이지 로드
  useEffect(() => {
    // 조건 체크
    if (filter === 'KEYWORD') return;
    if (isLoading) return; // 초기 로딩 중에는 다음 페이지 요청 방지
    if (!inView) return;
    if (!hasNextPage) return;
    if (isFetchingNextPage) return;
    if (fetchingRef.current) return; // 이미 요청 중이면 무시

    // 요청 시작
    fetchingRef.current = true;
    fetchNextPage().finally(() => {
      // 요청 완료 후 플래그 해제 (약간의 딜레이 추가)
      setTimeout(() => {
        fetchingRef.current = false;
      }, 500);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, isLoading, inView, hasNextPage, isFetchingNextPage]);

  // 즐겨찾기 탭 진입 시 최신 목록으로 갱신
  useEffect(() => {
    if (!isMounted) return;
    if (filter === 'FAVORITE') {
      refetch();
    }
  }, [filter, isMounted, refetch]);

  // 페이지 visibility 변경 시 새로고침
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuthState();
        if (filter === 'ALL') {
          refetch();
        }
        if (isLoggedIn) {
          loadKeywordCount();
          loadKeywordNoticesSilent();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [filter, isLoggedIn, refetch, checkAuthState, loadKeywordCount, loadKeywordNoticesSilent]);

  // 온보딩 완료 핸들러
  const handleOnboardingComplete = (categories: string[]) => {
    updateSelectedCategories(categories);
    setShowOnboarding(false);
  };

  // 토스트 메시지 표시
  const handleShowToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // 게시판 필터 적용
  const handleBoardFilterApply = async (boards: string[]) => {
    await updateSelectedCategories(boards);
    if (filter === 'KEYWORD') {
      const count = await loadKeywordCount();
      if (count === 0) {
        setKeywordNotices([]);
        return;
      }
      await loadKeywordNotices();
      return;
    }
    await refetch();
  };

  // 로그인 결과 처리 (쿼리 파라미터 확인)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const loginStatus = params.get('login');
    const showOnboardingParam = params.get('show_onboarding');
    const logoutStatus = params.get('logout');

    if (loginStatus === 'success') {
      if (showOnboardingParam === 'true') {
        setShowOnboarding(true);
      }
      setToastMessage('로그인에 성공했습니다!');
      setToastType('success');
      setShowToast(true);
      router.replace('/');
    } else if (loginStatus === 'failed') {
      setToastMessage('로그인 처리에 실패했습니다.');
      setToastType('error');
      setShowToast(true);
      router.replace('/');
    } else if (logoutStatus === 'success') {
      setToastMessage('로그아웃되었습니다.');
      setToastType('info');
      setShowToast(true);
      router.replace('/');
    }
  }, [router]);

  const selectedBoardsForList = filter === 'KEYWORD' ? ['keyword'] : selectedBoards;

  return (
    <>
      <OnboardingModal isOpen={showOnboarding} onComplete={handleOnboardingComplete} />

      <BoardFilterModal
        isOpen={showBoardFilterModal}
        onClose={() => setShowBoardFilterModal(false)}
        selectedBoards={selectedBoards}
        onApply={handleBoardFilterApply}
      />

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />

      <main className="h-full overflow-hidden bg-gray-50">
        <div className="relative flex flex-col w-full h-full max-w-md mx-auto overflow-hidden transition-all bg-white border-gray-100 shadow-xl border-x md:max-w-4xl">
          {/* 헤더 */}
          <div className="shrink-0" style={{ touchAction: 'none' }}>
            <HomeHeader
              onMenuClick={() => setIsSidebarOpen(true)}
              onNotificationClick={() => {
                markKeywordNoticesSeen(keywordNotices);
                router.push('/notifications');
              }}
              showNotificationBadge={isLoggedIn && hasNewKeywordNotices}
            />
          </div>

          {/* 카테고리 필터 */}
          <div className="shrink-0" style={{ touchAction: 'none' }}>
            <CategoryFilter
              activeFilter={filter}
              onFilterChange={(f) => setFilter(f as any)}
              isLoggedIn={isLoggedIn}
              onSettingsClick={() => setShowBoardFilterModal(true)}
              onShowToast={handleShowToast}
            />
          </div>

          {/* 키워드 필터일 때만 키워드 설정 바 표시 */}
          {filter === 'KEYWORD' && (
            <KeywordSettingsBar
              keywordCount={keywordCount ?? 0}
              onSettingsClick={() => router.push('/keywords')}
            />
          )}

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

          {/* 공지사항 리스트 */}
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
                loading={isLoading || isCategoriesLoading || !isMounted}
                selectedCategories={selectedBoardsForList}
                filteredNotices={filteredNotices}
                showKeywordPrefix={filter === 'KEYWORD' || filter === 'ALL'}
                onMarkAsRead={handleMarkAsRead}
                onToggleFavorite={handleToggleFavorite}
                isInFavoriteTab={filter === 'FAVORITE'}
                isLoggedIn={isLoggedIn}
                onOpenBoardFilter={() => setShowBoardFilterModal(true)}
                onShowToast={handleShowToast}
                emptyMessage={
                  filter === 'KEYWORD'
                    ? (keywordCount === 0
                      ? '키워드를 등록하면 관련 공지가 모여요'
                      : '아직 키워드에 맞는 공지사항이 없어요')
                    : '표시할 공지사항이 없어요'
                }
                emptyDescription={
                  filter === 'KEYWORD'
                    ? (keywordCount === 0
                      ? '키워드를 추가해 주세요'
                      : '새 공지가 올라오면 여기에 표시돼요')
                    : undefined
                }
              />

              {/* 무한 스크롤 */}
              {filter !== 'KEYWORD' && (
                <>
                  <div ref={loadMoreRef} className="h-1" />

                  {isFetchingNextPage && (
                    <div className="flex justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                  )}

                  {!hasNextPage && notices.length > 0 && (
                    <div className="py-8 text-center text-sm text-gray-400">
                      모든 공지사항을 불러왔어요
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>
      </main>
    </>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
