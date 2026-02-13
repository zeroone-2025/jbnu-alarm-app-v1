'use client';

import { useEffect, useState, useMemo, useRef, Suspense } from 'react';
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
import { useUser } from '@/_lib/hooks/useUser';
import { useFilterState } from './_hooks/useFilterState';
import { useKeywordNotices } from './_hooks/useKeywordNotices';
import { useNoticeActions } from './_hooks/useNoticeActions';
import { useNoticeFiltering } from './_hooks/useNoticeFiltering';
import OnboardingModal from './_components/OnboardingModal';
import NoticeList from './_components/NoticeList';
import HomeHeader from './_components/HomeHeader';
import Sidebar from '@/_components/layout/Sidebar';
import CategoryFilter from '@/_components/ui/CategoryFilter';
import KeywordSettingsBar from '@/_components/ui/KeywordSettingsBar';
import ScrollToTop from '@/_components/ui/ScrollToTop';
import PullToRefreshIndicator from '@/_components/ui/PullToRefreshIndicator';
import UserStatsBanner from '@/_components/ui/UserStatsBanner';

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
  const [toastKey, setToastKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Infinite scroll root element state
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);
  // 초기 마운트 시 visibilitychange 무시를 위한 ref
  const isInitialMount = useRef(true);

  // 클라이언트 마운트 체크
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Custom Hooks
  const { isLoggedIn, isAuthLoaded, refetch: refetchUser, user } = useUser();
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
    newKeywordCount, // 훅에서 반환한 값 사용
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
  const {
    data: noticePages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    // filter를 queryKey에 포함하여 필터별 독립적인 캐시 유지
    queryKey: ['notices', 'infinite', selectedBoardsParam, filter],
    queryFn: ({ pageParam }) => fetchNoticesInfinite(
      pageParam,
      20,
      true,
      selectedBoards,
      filter === 'FAVORITE'  // 클로저 문제 방지를 위해 직접 참조
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
    root: scrollRoot, // 스크롤 컨테이너를 root로 명시
    rootMargin: '0px 0px 2000px 0px', // 하단 2000px 미리 감지
    threshold: 0,
  });



  // 스크롤이 끝에 가까워지면 다음 페이지 로드
  useEffect(() => {
    // 조건 체크
    if (filter === 'KEYWORD') return;
    if (isLoading) return; // 초기 로딩 중에는 다음 페이지 요청 방지
    if (!inView) return;
    if (!hasNextPage) return;
    if (isFetchingNextPage) return;
    // 요청 시작
    fetchNextPage();
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
      // 초기 마운트 시에는 무시 (새로고침 시 중복 요청 방지)
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }

      if (document.visibilityState === 'visible') {
        if (isLoggedIn) {
          refetchUser(); // 유저 상태 및 로그인 정보 동기화
        }
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
  }, [filter, isLoggedIn, refetch, refetchUser, loadKeywordCount, loadKeywordNoticesSilent]);

  // 온보딩 완료 핸들러
  const handleOnboardingComplete = (categories: string[]) => {
    updateSelectedCategories(categories);
    setShowOnboarding(false);
  };

  // 토스트 메시지 표시
  const handleShowToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastKey(prev => prev + 1); // 매번 증가시켜 새 toast 트리거
    setShowToast(true);
  };

  // 게시판 필터 적용 (필요 시 유지하되, 현재는 /filter 페이지에서 처리)
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

  useEffect(() => {
    if (!isAuthLoaded || !isLoggedIn || !user) return;
    // user_type이 설정되어 있으면 이미 온보딩을 완료한 것
    const needsOnboarding = !user.user_type;
    if (needsOnboarding) {
      setShowOnboarding(true);
    }
  }, [isAuthLoaded, isLoggedIn, user]);

  const selectedBoardsForList = filter === 'KEYWORD' ? ['keyword'] : selectedBoards;

  return (
    <>
      <OnboardingModal isOpen={showOnboarding} onComplete={handleOnboardingComplete} onShowToast={handleShowToast} />

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
        triggerKey={toastKey}
      />

      <main className="h-full overflow-hidden bg-gray-50">
        <div className="relative flex flex-col w-full h-full max-w-md mx-auto overflow-hidden transition-all bg-white border-gray-100 shadow-xl border-x md:max-w-4xl">
          {/* 헤더 */}
          <div className="shrink-0" style={{ touchAction: 'none' }}>
            <HomeHeader
              onMenuClick={() => setIsSidebarOpen(true)}
              onNotificationClick={() => {
                // 이전 확인 시간을 쿼리 파라미터로 전달
                const lastSeen = localStorage.getItem('keyword_notice_seen_at');
                markKeywordNoticesSeen(keywordNotices);
                router.push(lastSeen ? `/notifications?last_seen=${encodeURIComponent(lastSeen)}` : '/notifications');
              }}
              notificationCount={newKeywordCount}
            />
          </div>

          {/* User Stats Banner */}
          <UserStatsBanner isLoggedIn={isLoggedIn} onSignupClick={() => setIsSidebarOpen(true)} />

          {/* 카테고리 필터 */}
          <div className="shrink-0" style={{ touchAction: 'none' }}>
            <CategoryFilter
              activeFilter={filter}
              onFilterChange={(f) => setFilter(f as any)}
              isLoggedIn={isLoggedIn}
              onSettingsClick={() => router.push('/filter')}
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
          <PullToRefreshIndicator
            isPulling={isPulling}
            pullDistance={pullDistance}
            refreshing={refreshing}
          />

          <ScrollToTop containerRef={scrollContainerRef as React.RefObject<HTMLElement>} />

          {/* 공지사항 리스트 */}
          <div className="relative flex-1 min-h-0 overflow-hidden">
            <div
              ref={(node) => {
                // scrollContainerRef와 scrollRoot 모두 업데이트
                if (scrollContainerRef && 'current' in scrollContainerRef) {
                  (scrollContainerRef as React.MutableRefObject<HTMLElement | null>).current = node;
                }
                if (node !== scrollRoot) {
                  setScrollRoot(node);
                }
              }}
              className="h-full overflow-y-auto"
              style={{
                touchAction: 'pan-y',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
              }}
            >
              <NoticeList
                loading={isLoading || isCategoriesLoading}
                selectedCategories={selectedBoardsForList}
                filteredNotices={filteredNotices}
                showKeywordPrefix={filter === 'KEYWORD' || filter === 'ALL'}
                onMarkAsRead={handleMarkAsRead}
                onToggleFavorite={handleToggleFavorite}
                isInFavoriteTab={filter === 'FAVORITE'}
                isLoggedIn={isLoggedIn}
                onOpenBoardFilter={() => router.push('/filter')}
                onShowToast={handleShowToast}
                emptyMessage={
                  filter === 'KEYWORD'
                    ? (keywordCount === 0
                      ? '키워드를 등록하면 관련 공지가 모여요'
                      : '아직 키워드에 맞는 공지사항이 없어요')
                    : filter === 'UNREAD'
                      ? '모든 공지사항을 다 읽었어요'
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
                  {/* 로딩 감지 및 수동 로드 영역 - 다음 페이지가 있을 때만 표시 */}
                  {hasNextPage && (
                    <div
                      ref={loadMoreRef}
                      className="py-4 text-center cursor-pointer text-gray-400 text-sm hover:text-gray-600 active:scale-95 transition-transform"
                      onClick={() => {
                        if (!isFetchingNextPage) {
                          fetchNextPage();
                        }
                      }}
                    >
                      {isFetchingNextPage ? (
                        <div className="flex justify-center items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                          <span>불러오는 중...</span>
                        </div>
                      ) : (
                        <span>더 불러오려면 터치하세요</span>
                      )}
                    </div>
                  )}

                  {/* 모든 데이터 로드 완료 메시지 - 다음 페이지가 없을 때만 표시 */}
                  {!hasNextPage && filteredNotices.length > 0 && (
                    <div className="py-8 text-center text-sm text-gray-400">
                      모든 공지사항을 불러왔어요
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onShowToast={handleShowToast} />
        </div>
      </main>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <main className="h-full overflow-hidden bg-gray-50">
        <div className="relative flex flex-col w-full h-full max-w-md mx-auto overflow-hidden bg-white border-gray-100 shadow-xl border-x md:max-w-4xl">
          <div className="flex-1 flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
          </div>
        </div>
      </main>
    }>
      <HomeContent />
    </Suspense>
  );
}
