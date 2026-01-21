'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  fetchNotices,
  getKeywordNotices,
  getMyKeywords,
  markNoticeAsRead,
  toggleNoticeFavorite,
  Notice,
} from '@/api';
import dayjs from 'dayjs';
import 'dayjs/locale/ko'; // 한국어 설정
import relativeTime from 'dayjs/plugin/relativeTime'; // '방금 전' 기능
import Toast from '@/components/Toast';
import { useSelectedCategories } from '@/hooks/useSelectedCategories';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import OnboardingModal from './components/OnboardingModal';
import NoticeList from './components/NoticeList';
import HomeHeader from './components/HomeHeader';
import Sidebar from '@/components/Sidebar';
import CategoryFilter from '@/components/CategoryFilter';
import BoardFilterModal from '@/components/BoardFilterModal';

// Dayjs 설정
dayjs.extend(relativeTime);
dayjs.locale('ko');


function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [keywordNotices, setKeywordNotices] = useState<Notice[]>([]);
  const [keywordCount, setKeywordCount] = useState<number | null>(null);
  const [hasNewKeywordNotices, setHasNewKeywordNotices] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false); // 온보딩 모달 표시 여부
  const [showToast, setShowToast] = useState(false); // 토스트 메시지 표시 여부
  const [toastMessage, setToastMessage] = useState(''); // 토스트 메시지 내용
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 사이드바 상태
  const initialFilter = searchParams.get('filter') ?? 'ALL';
  const [filter, setFilter] = useState(initialFilter); // 카테고리 필터 상태 (전체, 안읽음, 즐겨찾기, 키워드)
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
  const [showBoardFilterModal, setShowBoardFilterModal] = useState(false); // 게시판 필터 모달

  // 선택된 카테고리 관리 (Guest/User 모두 사용)
  const { selectedCategories, updateSelectedCategories } = useSelectedCategories();

  // 게시판 목록 결정 (Guest: localStorage, User: DB/API)
  const selectedBoards = selectedCategories;

  // 데이터 가져오기 함수
  const loadNotices = async () => {
    setLoading(true);
    try {
      // 모든 공지를 가져옴 (includeRead = true 고정)
      // 읽음/안읽음 필터링은 프론트엔드에서 처리
      // IMPORTANT: limit 200으로 증가 (날짜순 정렬 시 공과대학 공지가 밀리는 문제 방지)
      const data = await fetchNotices(0, 200, true);
      setNotices(data);
    } catch (error) {
      console.error('Failed to load notices', error);
    } finally {
      setLoading(false);
    }
  };

  const loadKeywordNotices = async () => {
    setLoading(true);
    try {
      const data = await getKeywordNotices(0, 200, true);
      setKeywordNotices(data);
    } catch (error) {
      console.error('Failed to load keyword notices', error);
    } finally {
      setLoading(false);
    }
  };

  const loadKeywordNoticesSilent = async () => {
    try {
      const data = await getKeywordNotices(0, 200, true);
      setKeywordNotices(data);
    } catch (error) {
      console.error('Failed to load keyword notices', error);
    }
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

  const updateNoticeState = (
    noticeId: number,
    updater: (notice: Notice) => Notice,
  ) => {
    setNotices((prevNotices) =>
      prevNotices.map((notice) => (notice.id === noticeId ? updater(notice) : notice)),
    );
    setKeywordNotices((prevNotices) =>
      prevNotices.map((notice) => (notice.id === noticeId ? updater(notice) : notice)),
    );
  };

  const refreshCurrentFilter = async () => {
    if (filter === 'KEYWORD') {
      const count = await loadKeywordCount();
      if (count === 0) {
        setKeywordNotices([]);
        return;
      }
      await loadKeywordNotices();
      return;
    }
    await loadNotices();
  };

  // Pull to Refresh 조건: KEYWORD 필터에서 키워드 0개면 비활성화
  const pullToRefreshEnabled = !(filter === 'KEYWORD' && keywordCount === 0);
  
  // Pull to Refresh 훅
  const { scrollContainerRef, isPulling, pullDistance, refreshing } = usePullToRefresh({
    onRefresh: refreshCurrentFilter,
    enabled: pullToRefreshEnabled,
  });

  const getLatestKeywordNoticeAt = (items: Notice[]) => {
    if (items.length === 0) return null;
    return items
      .map((notice) => new Date(notice.created_at ?? notice.date).getTime())
      .reduce((latest, current) => (current > latest ? current : latest), 0);
  };

  const updateKeywordBadge = (items: Notice[]) => {
    if (typeof window === 'undefined') return;
    if (items.length === 0) {
      setHasNewKeywordNotices(false);
      return;
    }
    const latest = getLatestKeywordNoticeAt(items);
    if (!latest) {
      setHasNewKeywordNotices(false);
      return;
    }
    const seenAt = localStorage.getItem('keyword_notice_seen_at');
    if (!seenAt) {
      setHasNewKeywordNotices(true);
      return;
    }
    setHasNewKeywordNotices(latest > new Date(seenAt).getTime());
  };

  const markKeywordNoticesSeen = (items: Notice[]) => {
    if (typeof window === 'undefined') return;
    const latest = getLatestKeywordNoticeAt(items);
    if (!latest) return;
    localStorage.setItem('keyword_notice_seen_at', new Date(latest).toISOString());
    setHasNewKeywordNotices(false);
  };


  /**
   * 공지사항 읽음 처리 (Optimistic Update)
   * 1. UI를 먼저 즉시 업데이트 (사용자 경험 향상)
   * 2. 백엔드 API 호출 (로그인 사용자만)
   * 3. 실패 시 롤백
   */
  const handleMarkAsRead = async (noticeId: number) => {
    // 비로그인 사용자: API 호출 차단 (401 에러 방지)
    if (!isLoggedIn) {
      return;
    }

    // 1. Optimistic Update: 즉시 UI 업데이트
    updateNoticeState(noticeId, (notice) => ({ ...notice, is_read: true }));

    // 2. 백엔드 API 호출 (로그인 사용자만)
    try {
      await markNoticeAsRead(noticeId);
      // 성공 시 이미 UI가 업데이트되어 있으므로 추가 작업 불필요
    } catch (error) {
      // 3. 실패 시 롤백: 원래 상태로 복구
      console.error('Failed to mark notice as read:', error);
      updateNoticeState(noticeId, (notice) => ({ ...notice, is_read: false }));
    }
  };

  /**
   * 즐겨찾기 토글 (Optimistic Update)
   * 1. UI를 먼저 즉시 업데이트
   * 2. 백엔드 API 호출 (로그인 사용자만)
   * 3. 실패 시 롤백
   */
  const handleToggleFavorite = async (noticeId: number) => {
    // 비로그인 사용자: 로그인 유도 후 차단 (401 에러 방지)
    if (!isLoggedIn) {
      alert('로그인 후 사용할 수 있는 기능입니다.');
      return;
    }

    // 1. Optimistic Update: 즉시 UI 업데이트 (토글)
    updateNoticeState(noticeId, (notice) => ({ ...notice, is_favorite: !notice.is_favorite }));

    // 2. 백엔드 API 호출 (로그인 사용자만)
    try {
      await toggleNoticeFavorite(noticeId);
      // 성공 시 이미 UI가 업데이트되어 있으므로 추가 작업 불필요
    } catch (error) {
      // 3. 실패 시 롤백: 원래 상태로 복구
      console.error('Failed to toggle favorite:', error);
      updateNoticeState(noticeId, (notice) => ({ ...notice, is_favorite: !notice.is_favorite }));
    }
  };

  // 초기화: 로그인 상태 확인 및 공지사항 로드
  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem('accessToken');
    const loggedIn = !!token;
    setIsLoggedIn(loggedIn);

    // 공지사항 로드
    loadNotices();
    if (loggedIn) {
      (async () => {
        const count = await loadKeywordCount();
        if (count > 0) {
          await loadKeywordNoticesSilent();
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filter === 'KEYWORD' && isLoggedIn) {
      (async () => {
        const count = await loadKeywordCount();
        if (count === 0) {
          setKeywordNotices([]);
          return;
        }
        await loadKeywordNotices();
      })();
    }
  }, [filter, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      setHasNewKeywordNotices(false);
      return;
    }
    updateKeywordBadge(keywordNotices);
  }, [keywordNotices, isLoggedIn]);

  useEffect(() => {
    if (filter === 'KEYWORD') {
      markKeywordNoticesSeen(keywordNotices);
    }
  }, [filter, keywordNotices]);

  // 페이지 visibility 변경 시 새로고침 (다른 탭 갔다가 돌아올 때)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 페이지가 다시 보이게 되면 로그인 상태 재확인 및 데이터 새로고침
        const token = localStorage.getItem('accessToken');
        const loggedIn = !!token;
        setIsLoggedIn(loggedIn);
        loadNotices();
        // 로그인 상태이면 키워드 목록도 갱신 (ALL 탭에서 라벨 표시를 위해)
        if (loggedIn) {
          loadKeywordCount();
          loadKeywordNoticesSilent();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // 온보딩 모달 자동 표시 비활성화
  // 기본값(home_campus)으로 시작하고, 사용자가 원할 때 설정에서 변경 가능
  // useEffect(() => {
  //   const savedCategories = localStorage.getItem('my_subscribed_categories');
  //   if (!savedCategories) {
  //     setShowOnboarding(true);
  //   }
  // }, []);

  // 온보딩 완료 핸들러
  const handleOnboardingComplete = (categories: string[]) => {
    // localStorage에 이미 저장되었으므로 (OnboardingModal에서)
    // useSelectedCategories 훅을 업데이트만 하면 됨
    updateSelectedCategories(categories);
    setShowOnboarding(false);
  };

  // 토스트 메시지 표시 헬퍼 함수
  const handleShowToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // 게시판 필터 적용 핸들러
  const handleBoardFilterApply = async (boards: string[]) => {
    await updateSelectedCategories(boards);
    // 게시판 변경 시 공지사항 목록 자동 새로고침
    await refreshCurrentFilter();
  };

  // 로그인 결과 처리 (쿼리 파라미터 확인)
  useEffect(() => {
    const loginStatus = searchParams.get('login');
    const showOnboardingParam = searchParams.get('show_onboarding');
    const logoutStatus = searchParams.get('logout');

    if (loginStatus === 'success') {
      // 온보딩 모달 표시 여부 확인
      if (showOnboardingParam === 'true') {
        setShowOnboarding(true);
      }

      setToastMessage('로그인에 성공했습니다!');
      setToastType('success');
      setShowToast(true);
      // 파라미터 제거
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
  }, [searchParams, router]);

  const selectedBoardsForList = filter === 'KEYWORD' ? ['keyword'] : selectedBoards;

  const boardFilteredNotices = notices.filter((notice) => selectedBoards.includes(notice.board_code));
  const mergeNoticesForAll = (primary: Notice[], extra: Notice[]) => {
    const noticeMap = new Map<number, Notice>();
    primary.forEach((notice) => noticeMap.set(notice.id, notice));
    extra.forEach((notice) => {
      if (!noticeMap.has(notice.id)) {
        noticeMap.set(notice.id, notice);
      }
    });

    return Array.from(noticeMap.values()).sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.id - a.id;
    });
  };

  // 1단계: 게시판/키워드 필터링
  let filteredNotices = boardFilteredNotices;
  if (filter === 'KEYWORD') {
    filteredNotices = keywordNotices;
  } else if (filter === 'ALL') {
    filteredNotices = mergeNoticesForAll(boardFilteredNotices, keywordNotices);
  }

  // 2단계: 카테고리 필터 적용 (전체, 안읽음, 즐겨찾기)
  if (filter === 'UNREAD') {
    // 안 읽음: is_read가 false인 공지만
    filteredNotices = filteredNotices.filter((notice) => !notice.is_read);
  } else if (filter === 'FAVORITE') {
    // 즐겨찾기: is_favorite가 true인 공지만
    filteredNotices = filteredNotices.filter((notice) => notice.is_favorite);
  }
  // 'ALL'은 모든 공지 표시 (selectedBoards 필터링만 적용)

  return (
    <>
      {/* 온보딩 모달 */}
      <OnboardingModal isOpen={showOnboarding} onComplete={handleOnboardingComplete} />

      {/* 게시판 필터 모달 */}
      <BoardFilterModal
        isOpen={showBoardFilterModal}
        onClose={() => setShowBoardFilterModal(false)}
        selectedBoards={selectedBoards}
        onApply={handleBoardFilterApply}
      />

      {/* 토스트 메시지 */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />

      <main className="h-full overflow-hidden bg-gray-50">
        {/* --- 반응형 컨테이너 (모바일: 꽉 참, 태블릿+: 넓어짐) --- */}
        <div className="relative flex flex-col w-full h-full max-w-md mx-auto overflow-hidden transition-all bg-white border-gray-100 shadow-xl border-x md:max-w-4xl">
          {/* 1. 헤더 (고정) - touch-action: none으로 터치 스크롤 차단 */}
          <div className="shrink-0" style={{ touchAction: 'none' }}>
            <HomeHeader
              onMenuClick={() => setIsSidebarOpen(true)}
              onNotificationClick={() => {
                const returnTo = `/?filter=${filter}`;
                markKeywordNoticesSeen(keywordNotices);
                router.push(`/notifications/keyword?returnTo=${encodeURIComponent(returnTo)}`);
              }}
              showNotificationBadge={isLoggedIn && hasNewKeywordNotices}
            />
          </div>

          {/* 2. 카테고리 필터 (고정) - touch-action: none으로 터치 스크롤 차단 */}
          <div className="shrink-0" style={{ touchAction: 'none' }}>
            <CategoryFilter
              activeFilter={filter}
              onFilterChange={setFilter}
              isLoggedIn={isLoggedIn}
              onSettingsClick={() => setShowBoardFilterModal(true)}
              onShowToast={handleShowToast}
            />
          </div>

          {/* Pull to Refresh 인디케이터 - overflow-hidden 밖에 배치 */}
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

          {/* 3. 공지사항 리스트 (Pull to Refresh 지원) */}
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
                emptyActionLabel={
                  filter === 'KEYWORD' && keywordNotices.length === 0
                    ? (keywordCount === 0 ? '키워드 추가' : '키워드 관리')
                    : undefined
                }
                onEmptyActionClick={
                  filter === 'KEYWORD' && keywordNotices.length === 0
                    ? () => {
                      const returnTo = `/?filter=${filter}`;
                      router.push(`/keywords?returnTo=${encodeURIComponent(returnTo)}`);
                    }
                    : undefined
                }
              />
            </div>
          </div>

          {/* 4. 사이드바 (컨테이너 내부에 배치) */}
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
