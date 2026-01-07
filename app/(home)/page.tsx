'use client';

import { useEffect, useState } from 'react';
import {
  fetchNotices,
  triggerCrawl,
  markNoticeAsRead,
  Notice,
} from '@/api';
import dayjs from 'dayjs';
import 'dayjs/locale/ko'; // 한국어 설정
import relativeTime from 'dayjs/plugin/relativeTime'; // '방금 전' 기능
import OnboardingModal from './components/OnboardingModal';
import NoticeList from './components/NoticeList';
import HomeHeader from './components/HomeHeader';
import { useSelectedCategories } from '@/hooks/useSelectedCategories';

// Dayjs 설정
dayjs.extend(relativeTime);
dayjs.locale('ko');

export default function Home() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // 크롤링 중 표시
  const [includeRead, setIncludeRead] = useState(false); // 읽은 공지 포함 여부
  const [isConfigLoaded, setIsConfigLoaded] = useState(false); // 설정 로딩 완료 여부 (Race Condition 방지)
  const [showOnboarding, setShowOnboarding] = useState(false); // 온보딩 모달 표시 여부
  const [showToast, setShowToast] = useState(false); // 토스트 메시지 표시 여부
  const [toastMessage, setToastMessage] = useState(''); // 토스트 메시지 내용

  // 선택된 카테고리 관리 (온보딩 프리셋 + 추가 선택)
  const { selectedCategories, updateSelectedCategories } = useSelectedCategories();

  // 데이터 가져오기 함수
  const loadNotices = async () => {
    setLoading(true);
    try {
      // Backend 필터링: includeRead 파라미터로 읽은 공지 제외/포함
      // IMPORTANT: limit 200으로 증가 (날짜순 정렬 시 공과대학 공지가 밀리는 문제 방지)
      const data = await fetchNotices(0, 200, includeRead);
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

  // CRITICAL: 로딩 시퀀스 제어 (Race Condition 방지)
  // Step 1: 설정 먼저 로드
  // Step 2: 설정 로딩 완료 후 공지사항 로드
  useEffect(() => {
    // 1. 사용자 설정 로드 (includeRead) - 로컬 스토리지 사용
    const savedIncludeRead = localStorage.getItem('include_read');
    if (savedIncludeRead !== null) {
      setIncludeRead(savedIncludeRead === 'true');
    }
    setIsConfigLoaded(true); // 설정 로딩 완료
  }, []);

  // 설정 로딩 완료 후 공지사항 로드
  useEffect(() => {
    if (isConfigLoaded) {
      loadNotices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfigLoaded, includeRead]);

  // 온보딩 필요 여부 확인
  useEffect(() => {
    const savedCategories = localStorage.getItem('my_subscribed_categories');
    if (!savedCategories) {
      setShowOnboarding(true);
    }
  }, []);

  // 온보딩 완료 핸들러
  const handleOnboardingComplete = (categories: string[]) => {
    // localStorage에 이미 저장되었으므로 (OnboardingModal에서)
    // useSelectedCategories 훅을 업데이트만 하면 됨
    updateSelectedCategories(categories);
    setShowOnboarding(false);
  };

  // 읽음 필터 토글 핸들러 (로컬 스토리지 저장)
  const handleToggleIncludeRead = async () => {
    const newValue = !includeRead;

    // 1. UI 즉시 반영
    setIncludeRead(newValue);

    // 2. 로컬 스토리지 저장
    localStorage.setItem('include_read', String(newValue));

    // 토스트 메시지 표시
    const message = newValue
      ? '이제 읽은 공지도 함께 표시됩니다.'
      : '안 읽은 공지만 모아서 봅니다.';
    setToastMessage(message);
    setShowToast(true);

    // 3초 후 자동으로 토스트 숨기기
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // 구독한 카테고리만 필터링 (온보딩 프리셋 + 추가 선택)
  const filteredNotices = notices.filter((notice) => selectedCategories.includes(notice.category));

  return (
    <>
      {/* 온보딩 모달 */}
      <OnboardingModal isOpen={showOnboarding} onComplete={handleOnboardingComplete} />

      {/* 토스트 메시지 */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 transition-all duration-300">
          <div className="rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">
            {toastMessage}
          </div>
        </div>
      )}

      <main className="h-full overflow-hidden bg-gray-50">
        {/* --- 반응형 컨테이너 (모바일: 꽉 참, 태블릿+: 넓어짐) --- */}
        <div className="mx-auto flex h-full w-full max-w-md flex-col border-x border-gray-100 bg-white shadow-xl transition-all md:max-w-4xl">
          {/* 1. 헤더 */}
          <HomeHeader
            includeRead={includeRead}
            refreshing={refreshing}
            onToggleIncludeRead={handleToggleIncludeRead}
            onRefresh={handleRefresh}
          />

          {/* 2. 공지사항 리스트 */}
          <NoticeList
            loading={loading}
            selectedCategories={selectedCategories}
            filteredNotices={filteredNotices}
            onRefresh={handleRefresh}
            onMarkAsRead={handleMarkAsRead}
          />
        </div>
      </main>
    </>
  );
}
