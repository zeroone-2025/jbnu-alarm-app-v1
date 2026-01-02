'use client';

import { useEffect, useState, useRef } from 'react';
import { fetchNotices, triggerCrawl, Notice } from '@/lib/api';
import dayjs from 'dayjs';
import 'dayjs/locale/ko'; // 한국어 설정
import relativeTime from 'dayjs/plugin/relativeTime'; // '방금 전' 기능
import { FiRefreshCw, FiExternalLink } from 'react-icons/fi'; // 아이콘

// Dayjs 설정
dayjs.extend(relativeTime);
dayjs.locale('ko');

export default function Home() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // 크롤링 중 표시
  const [tab, setTab] = useState<'all' | 'homepage' | 'csai'>('all');
  const scrollRef = useRef<HTMLUListElement>(null);

  // 탭 변경 시 스크롤 최상단 이동
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [tab]);

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

  // 탭 필터링 로직
  const filteredNotices = notices.filter((notice) => {
    if (tab === 'all') return true;
    console.log(tab);
    return notice.category === tab; // 'homepage' or 'csai'
  });

  return (
    <main className="h-screen overflow-hidden bg-gray-50">
      {/* --- 반응형 컨테이너 (모바일: 꽉 참, 태블릿+: 넓어짐) --- */}
      <div className="mx-auto flex h-full w-full max-w-md flex-col border-x border-gray-100 bg-white shadow-xl transition-all md:max-w-4xl">
        {/* 1. 헤더 */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-5">
          <h1 className="text-xl font-bold text-gray-800">📢 전북대 알리미</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`rounded-full p-2 transition-all hover:bg-gray-100 ${
              refreshing ? 'animate-spin text-blue-500' : 'text-gray-600'
            }`}
          >
            <FiRefreshCw size={20} />
          </button>
        </header>

        {/* 2. 탭 메뉴 */}
        <div className="flex shrink-0 border-b border-gray-100 bg-white">
          {['all', 'homepage', 'csai'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`relative flex-1 py-3 text-sm font-medium transition-colors ${
                tab === t ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'all' ? '전체' : t === 'csai' ? '컴인지' : '학교공지'}
              {/* 활성 탭 밑줄 애니메이션 */}
              {tab === t && <div className="absolute bottom-0 left-0 h-[2px] w-full bg-blue-600" />}
            </button>
          ))}
        </div>

        {/* 3. 공지사항 리스트 */}
        <ul
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-gray-50 p-0 md:p-5"
        >
          <div className="divide-y divide-gray-100 md:grid md:grid-cols-1 md:gap-4 md:divide-y-0">
            {loading
              ? // 로딩 스켈레톤 UI
                [...Array(6)].map((_, i) => (
                  <li
                    key={i}
                    className="animate-pulse bg-white p-5 md:rounded-xl md:border md:border-gray-100 md:shadow-sm"
                  >
                    <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                    <div className="h-3 w-1/4 rounded bg-gray-100"></div>
                  </li>
                ))
              : filteredNotices.length > 0
              ? filteredNotices.map((notice) => (
                  <li
                    key={notice.id}
                    className="bg-white transition-all hover:bg-gray-50 md:rounded-xl md:border md:border-gray-100 md:shadow-sm md:hover:-translate-y-0.5 md:hover:shadow-md"
                  >
                    <a
                      href={notice.link}
                      target="_blank"
                      rel="noreferrer"
                      className="block p-5"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        {/* 카테고리 배지 */}
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                            notice.category === 'csai'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {notice.category.toUpperCase()}
                        </span>
                        {/* 날짜 (오늘이면 빨간색 강조) */}
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          {notice.date}
                          {/* 오늘 날짜랑 같으면 New 표시 */}
                          {notice.date === dayjs().format('YYYY-MM-DD') && (
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                          )}
                        </span>
                      </div>

                      {/* 제목 */}
                      <h3 className="mb-1 line-clamp-2 text-[15px] leading-snug font-medium text-gray-800">
                        {notice.title}
                      </h3>

                      {/* 하단 정보 (몇 시간 전) */}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {dayjs(notice.crawled_at).fromNow()} 수집됨
                        </span>
                        <FiExternalLink className="text-gray-300" size={14} />
                      </div>
                    </a>
                  </li>
                ))
              : (
                // 데이터 없을 때
                <div className="col-span-full py-20 text-center text-gray-400">
                  <p>표시할 공지사항이 없어요 😢</p>
                  <button onClick={handleRefresh} className="mt-2 text-sm text-blue-500 underline">
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
