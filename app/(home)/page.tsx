'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  fetchNotices,
  triggerCrawl,
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

// Dayjs 설정
dayjs.extend(relativeTime);
dayjs.locale('ko');

export default function Home() {
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

  // 선택된 카테고리 관리 (로그인 사용자만 사용)
  const { selectedCategories, updateSelectedCategories } = useSelectedCategories();

  // 게시판 목록 결정:
  // - 게스트(비로그인): 무조건 home_campus만 (localStorage 무시)
  // - 로그인 사용자: localStorage 구독 정보 사용 (없으면 home_campus)
  const selectedBoards = isLoggedIn
    ? (selectedCategories.length > 0 ? selectedCategories : ['home_campus'])
    : ['home_campus'];

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

  // 수동 크롤링 & 새로고침
  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await triggerCrawl(); // 1. 크롤링 요청
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 2. 1초 대기 (DB저장 시간 벌기)
      await loadNotices(); // 3. 목록 다시 불러오기
    } catch (error) {
      alert('크롤링 실패!');
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * 공지사항 읽음 처리 (Optimistic Update)
   * 1. UI를 먼저 즉시 업데이트 (사용자 경험 향상)
   * 2. 백엔드 API 호출
   * 3. 실패 시 롤백
   */
  const handleMarkAsRead = async (noticeId: number) => {
    // 1. Optimistic Update: 즉시 UI 업데이트
    setNotices((prevNotices) =>
      prevNotices.map((notice) => (notice.id === noticeId ? { ...notice, is_read: true } : notice)),
    );

    // 2. 백엔드 API 호출
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
   * 2. 백엔드 API 호출
   * 3. 실패 시 롤백
   */
  const handleToggleFavorite = async (noticeId: number) => {
    // 1. Optimistic Update: 즉시 UI 업데이트 (토글)
    setNotices((prevNotices) =>
      prevNotices.map((notice) =>
        notice.id === noticeId ? { ...notice, is_favorite: !notice.is_favorite } : notice,
      ),
    );

    // 2. 백엔드 API 호출
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

  // 로그인 결과 처리 (쿼리 파라미터 확인)
  useEffect(() => {
    const loginStatus = searchParams.get('login');
    if (loginStatus === 'success') {
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

      {/* 토스트 메시지 */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />

      <main className="h-full overflow-hidden bg-gray-50">
        {/* --- 반응형 컨테이너 (모바일: 꽉 참, 태블릿+: 넓어짐) --- */}
        <div className="relative mx-auto flex h-full w-full max-w-md flex-col overflow-hidden border-x border-gray-100 bg-white shadow-xl transition-all md:max-w-4xl">
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
          <CategoryFilter activeFilter={filter} onFilterChange={setFilter} isLoggedIn={isLoggedIn} />

          {/* 3. 공지사항 리스트 */}
          <NoticeList
            loading={loading}
            selectedCategories={selectedCategories}
            filteredNotices={filteredNotices}
            onRefresh={handleRefresh}
            onMarkAsRead={handleMarkAsRead}
            onToggleFavorite={handleToggleFavorite}
            isInFavoriteTab={filter === 'FAVORITE'}
          />

          {/* 4. 사이드바 (컨테이너 내부에 배치) */}
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>
      </main>
    </>
  );
}
