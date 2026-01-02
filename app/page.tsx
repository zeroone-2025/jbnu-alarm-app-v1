'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { fetchNotices, triggerCrawl, markNoticeAsRead, fetchUserConfig, updateUserConfig, Notice } from '@/lib/api';
import dayjs from 'dayjs';
import 'dayjs/locale/ko'; // 한국어 설정
import relativeTime from 'dayjs/plugin/relativeTime'; // '방금 전' 기능
import { FiRefreshCw, FiEye, FiEyeOff } from 'react-icons/fi'; // 아이콘
import NoticeCard from '@/components/NoticeCard';
import OnboardingModal from '@/components/OnboardingModal';
import { useSelectedCategories } from '@/hooks/useSelectedCategories';
import Link from 'next/link';

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
  const scrollRef = useRef<HTMLUListElement>(null);

  // 선택된 카테고리 관리 (온보딩 프리셋 + 추가 선택)
  const { selectedCategories, updateSelectedCategories } = useSelectedCategories();

  // 데이터 가져오기 함수
  const loadNotices = async () => {
    setLoading(true);
    try {
      // Backend 필터링: includeRead 파라미터로 읽은 공지 제외/포함
      const data = await fetchNotices(0, 100, includeRead);
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
      prevNotices.map((notice) =>
        notice.id === noticeId ? { ...notice, is_read: true } : notice
      )
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
          notice.id === noticeId ? { ...notice, is_read: false } : notice
        )
      );
    }
  };

  // CRITICAL: 로딩 시퀀스 제어 (Race Condition 방지)
  // Step 1: 설정 먼저 로드
  // Step 2: 설정 로딩 완료 후 공지사항 로드
  useEffect(() => {
    const initializeData = async () => {
      try {
        // 1. 사용자 설정 로드 (includeRead)
        const config = await fetchUserConfig();
        setIncludeRead(config.include_read);
        setIsConfigLoaded(true); // 설정 로딩 완료
      } catch (error) {
        console.error('Failed to load user config:', error);
        setIsConfigLoaded(true); // 에러여도 진행
      }
    };

    initializeData();
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

  // 읽음 필터 토글 핸들러 (Optimistic Update + API 연동)
  const handleToggleIncludeRead = async () => {
    const newValue = !includeRead;

    // 1. Optimistic Update: UI 즉시 반영
    setIncludeRead(newValue);

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

    // 2. 백엔드 API 호출
    try {
      await updateUserConfig(newValue);
      // 성공 시 공지사항 목록은 useEffect dependency에 의해 자동 재조회됨
    } catch (error) {
      console.error('Failed to update user config:', error);
      // 3. 실패 시 롤백
      setIncludeRead(!newValue);
      setToastMessage('설정 업데이트 실패. 다시 시도해주세요.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // 구독한 카테고리만 필터링 (온보딩 프리셋 + 추가 선택)
  const filteredNotices = notices.filter((notice) =>
    selectedCategories.includes(notice.category)
  );

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
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-5">
          <h1 className="text-xl font-bold text-gray-800">📢 전북대 알리미</h1>
          <div className="flex items-center gap-2">
            {/* 읽음 필터 버튼 */}
            <button
              onClick={handleToggleIncludeRead}
              className={`rounded-full p-2 transition-all hover:bg-gray-100 ${
                includeRead ? 'text-blue-500' : 'text-gray-600'
              }`}
              aria-label={includeRead ? '읽은 공지 포함 중' : '안 읽은 공지만 보기'}
              title={includeRead ? '읽은 공지도 함께 보는 중' : '안 읽은 공지만 보는 중'}
            >
              {includeRead ? <FiEye size={20} /> : <FiEyeOff size={20} />}
            </button>

            {/* 새로고침 버튼 */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`rounded-full p-2 transition-all hover:bg-gray-100 ${
                refreshing ? 'animate-spin text-blue-500' : 'text-gray-600'
              }`}
              aria-label="새로고침"
            >
              <FiRefreshCw size={20} />
            </button>
          </div>
        </header>

        {/* 2. 공지사항 리스트 */}
        <ul
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-gray-50 p-0 md:p-5"
        >
          <div className="divide-y divide-gray-100 md:grid md:grid-cols-1 md:gap-4 md:divide-y-0">
            {loading ? (
              // 로딩 스켈레톤 UI
              [...Array(6)].map((_, i) => (
                <li
                  key={i}
                  className="animate-pulse bg-white p-5 md:rounded-xl md:border md:border-gray-100 md:shadow-sm"
                >
                  <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                  <div className="h-3 w-1/4 rounded bg-gray-100"></div>
                </li>
              ))
            ) : selectedCategories.length === 0 ? (
              // 선택된 카테고리가 없을 때
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl">📭</div>
                <p className="mt-4 text-gray-400">
                  선택된 알림 카테고리가 없습니다
                </p>
                <Link
                  href="/settings"
                  className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                >
                  설정에서 카테고리 선택하기
                </Link>
              </div>
            ) : filteredNotices.length > 0 ? (
              filteredNotices.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))
            ) : (
              // 데이터 없을 때
              <div className="col-span-full py-20 text-center text-gray-400">
                <p>표시할 공지사항이 없어요 😢</p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 text-sm text-blue-500 underline"
                >
                  데이터 새로고침
                </button>
              </div>
            )}
          </div>
        </ul>
      </div>
    </main>
    </>
  );
}
