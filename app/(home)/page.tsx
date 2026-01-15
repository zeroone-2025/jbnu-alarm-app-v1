'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  fetchNotices,
  markNoticeAsRead,
  toggleNoticeFavorite,
  Notice,
} from '@/api';
import dayjs from 'dayjs';
import 'dayjs/locale/ko'; // 한국어 설정
import relativeTime from 'dayjs/plugin/relativeTime'; // '방금 전' 기능
import Toast from '@/components/Toast';
import { useSelectedCategories } from '@/hooks/useSelectedCategories';
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
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // 크롤링 중 표시
  const [showOnboarding, setShowOnboarding] = useState(false); // 온보딩 모달 표시 여부
  const [showToast, setShowToast] = useState(false); // 토스트 메시지 표시 여부
  const [toastMessage, setToastMessage] = useState(''); // 토스트 메시지 내용
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 사이드바 상태
  const [filter, setFilter] = useState('ALL'); // 카테고리 필터 상태 (전체, 안읽음, 최신공지, 즐겨찾기)
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
  const [isPulling, setIsPulling] = useState(false); // Pull to Refresh 상태
  const [pullDistance, setPullDistance] = useState(0); // 당긴 거리
  const touchStartY = useRef(0); // 터치 시작 Y 좌표
  const scrollContainerRef = useRef<HTMLElement>(null); // 스크롤 컨테이너 참조
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
    setNotices((prevNotices) =>
      prevNotices.map((notice) => (notice.id === noticeId ? { ...notice, is_read: true } : notice)),
    );

    // 2. 백엔드 API 호출 (로그인 사용자만)
    try {
      await markNoticeAsRead(noticeId);
      // 성공 시 이미 UI가 업데이트되어 있으므로 추가 작업 불필요
    } catch (error) {
      // 3. 실패 시 롤백: 원래 상태로 복구
      console.error('Failed to mark notice as read:', error);
      setNotices((prevNotices) =>
        prevNotices.map((notice) =>
          notice.id === noticeId ? { ...notice, is_read: false } : notice,
        ),
      );
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
    setNotices((prevNotices) =>
      prevNotices.map((notice) =>
        notice.id === noticeId ? { ...notice, is_favorite: !notice.is_favorite } : notice,
      ),
    );

    // 2. 백엔드 API 호출 (로그인 사용자만)
    try {
      await toggleNoticeFavorite(noticeId);
      // 성공 시 이미 UI가 업데이트되어 있으므로 추가 작업 불필요
    } catch (error) {
      // 3. 실패 시 롤백: 원래 상태로 복구
      console.error('Failed to toggle favorite:', error);
      setNotices((prevNotices) =>
        prevNotices.map((notice) =>
          notice.id === noticeId ? { ...notice, is_favorite: !notice.is_favorite } : notice,
        ),
      );
    }
  };

  // 초기화: 로그인 상태 확인 및 공지사항 로드
  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);

    // 공지사항 로드
    loadNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 페이지 visibility 변경 시 새로고침 (다른 탭 갔다가 돌아올 때)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 페이지가 다시 보이게 되면 로그인 상태 재확인 및 데이터 새로고침
        const token = localStorage.getItem('accessToken');
        setIsLoggedIn(!!token);
        loadNotices();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pull to Refresh 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // 스크롤이 최상단에 있을 때만 작동
    if (container.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (!container || touchStartY.current === 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStartY.current;

    // 아래로 당길 때만 (distance > 0) & 스크롤 최상단일 때
    if (distance > 0 && container.scrollTop === 0) {
      e.preventDefault();
      setIsPulling(true);

      // Rubber band effect: 저항감을 주기 위한 감쇠 함수
      // 멀리 당길수록 저항이 증가 (최대 80px)
      const maxDistance = 80;
      const dampingFactor = 0.5;
      const dampedDistance = maxDistance * (1 - Math.exp(-distance * dampingFactor / maxDistance));

      setPullDistance(Math.min(dampedDistance, maxDistance));
    }
  };

  const handleTouchEnd = async () => {
    if (isPulling && pullDistance > 30) {
      // 30px 이상 당기면 새로고침
      setRefreshing(true);
      await loadNotices();
      setRefreshing(false);
    }

    // 상태 초기화
    setIsPulling(false);
    setPullDistance(0);
    touchStartY.current = 0;
  };

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
    await loadNotices();
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

  // 1단계: 게시판 필터링 (Guest: home_campus만, User: 구독한 게시판)
  let filteredNotices = notices.filter((notice) => selectedBoards.includes(notice.board_code));

  // 2단계: 카테고리 필터 적용 (전체, 안읽음, 최신공지, 즐겨찾기)
  if (filter === 'UNREAD') {
    // 안 읽음: is_read가 false인 공지만
    filteredNotices = filteredNotices.filter((notice) => !notice.is_read);
  } else if (filter === 'LATEST') {
    // 최신 공지: 최근 3일 이내 공지
    filteredNotices = filteredNotices.filter((notice) => {
      const daysAgo = dayjs().diff(dayjs(notice.date), 'day');
      return daysAgo <= 3;
    });
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
          {/* 1. 헤더 */}
          <HomeHeader
            onMenuClick={() => setIsSidebarOpen(true)}
            onNotificationClick={() => {
              setToastMessage('알림 기능은 준비 중입니다.');
              setToastType('info');
              setShowToast(true);
            }}
          />

          {/* 2. 카테고리 필터 */}
          <CategoryFilter
            activeFilter={filter}
            onFilterChange={setFilter}
            isLoggedIn={isLoggedIn}
            onSettingsClick={() => setShowBoardFilterModal(true)}
            onShowToast={handleShowToast}
          />

          {/* 3. 공지사항 리스트 (Pull to Refresh 지원) */}
          <div
            className="relative flex-1 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Pull to Refresh 인디케이터 */}
            {isPulling && (
              <div
                className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center bg-gradient-to-b from-gray-50 to-transparent"
                style={{
                  height: `${pullDistance}px`,
                  opacity: Math.min(pullDistance / 50, 1),
                  transition: 'opacity 0.1s ease-out',
                }}
              >
                <div
                  className="text-sm font-medium text-gray-600"
                  style={{
                    transform: `scale(${Math.min(pullDistance / 40, 1)})`,
                    transition: 'transform 0.1s ease-out',
                  }}
                >
                  {pullDistance > 30 ? '↓ 놓아서 새로고침' : '↓ 당겨서 새로고침'}
                </div>
              </div>
            )}

            {/* 새로고침 중 스피너 */}
            {refreshing && (
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center h-16 bg-gray-50">
                <div className="w-6 h-6 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
              </div>
            )}

            <div
              ref={scrollContainerRef as React.RefObject<HTMLDivElement>}
              className="h-full overflow-y-auto"
              style={{
                marginTop: refreshing ? '64px' : isPulling ? `${pullDistance}px` : '0',
                transition: isPulling ? 'none' : 'margin-top 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <NoticeList
                loading={loading}
                selectedCategories={selectedBoards}
                filteredNotices={filteredNotices}
                onMarkAsRead={handleMarkAsRead}
                onToggleFavorite={handleToggleFavorite}
                isInFavoriteTab={filter === 'FAVORITE'}
                isLoggedIn={isLoggedIn}
                onOpenBoardFilter={() => setShowBoardFilterModal(true)}
                onShowToast={handleShowToast}
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
