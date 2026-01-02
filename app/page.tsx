'use client';

import { useEffect, useState, useRef } from 'react';
import { fetchNotices, triggerCrawl, Notice } from '@/lib/api';
import dayjs from 'dayjs';
import 'dayjs/locale/ko'; // 한국어 설정
import relativeTime from 'dayjs/plugin/relativeTime'; // '방금 전' 기능
import { FiRefreshCw } from 'react-icons/fi'; // 아이콘
import NoticeCard from '@/components/NoticeCard';
import { useSelectedCategories } from '@/hooks/useSelectedCategories';
import Link from 'next/link';

// Dayjs 설정
dayjs.extend(relativeTime);
dayjs.locale('ko');

export default function Home() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // 크롤링 중 표시
  const scrollRef = useRef<HTMLUListElement>(null);

  // 선택된 카테고리 관리
  const { selectedCategories } = useSelectedCategories();

  // 데이터 가져오기 함수
  const loadNotices = async () => {
    setLoading(true);
    try {
      // MVP라 일단 100개 긁어와서 클라이언트 필터링 (나중엔 API로 필터링 추천)
      const data = await fetchNotices(0, 100);
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

  // 첫 접속 시 로딩
  useEffect(() => {
    loadNotices();
  }, []);

  // Exclusive 필터링: 선택된 카테고리만 표시
  const filteredNotices = notices.filter((notice) =>
    selectedCategories.includes(notice.category)
  );

  return (
    <main className="h-full overflow-hidden bg-gray-50">
      {/* --- 반응형 컨테이너 (모바일: 꽉 참, 태블릿+: 넓어짐) --- */}
      <div className="mx-auto flex h-full w-full max-w-md flex-col border-x border-gray-100 bg-white shadow-xl transition-all md:max-w-4xl">
        {/* 1. 헤더 */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-5">
          <h1 className="text-xl font-bold text-gray-800">📢 전북대 알리미</h1>
          <div className="flex items-center gap-2">
            {/* 새로고침 버튼 */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`rounded-full p-2 transition-all hover:bg-gray-100 ${
                refreshing ? 'animate-spin text-blue-500' : 'text-gray-600'
              }`}
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
                <NoticeCard key={notice.id} notice={notice} />
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
  );
}
