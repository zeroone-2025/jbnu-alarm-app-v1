'use client';

import { useEffect } from 'react';

import { Capacitor } from '@capacitor/core';
import dayjs from 'dayjs';
import { FiArrowLeft } from 'react-icons/fi';
import { useInView } from 'react-intersection-observer';

import CategoryBadge from '@/_components/ui/CategoryBadge';
import { incrementNoticeView } from '@/_lib/api/notices';
import { useSmartBack } from '@/_lib/hooks/useSmartBack';
import { useUser } from '@/_lib/hooks/useUser';
import type { Notice } from '@/_types/notice';

import HighlightedTitle from './HighlightedTitle';
import SearchFilters from './SearchFilters';
import SearchHistory from './SearchHistory';
import SearchInput from './SearchInput';
import SearchResultHeader from './SearchResultHeader';
import { useSearchNotices } from '../_hooks/useSearchNotices';
import { useSearchState } from '../_hooks/useSearchState';

import { openUrl } from '@/_lib/utils/openUrl';

export default function SearchContent() {
  const goBack = useSmartBack('/');
  const { isLoggedIn } = useUser();

  const {
    query,
    setQuery,
    submittedQuery,
    submitQuery,
    dateRange,
    setDateRange,
    selectedBoards,
    setSelectedBoards,
    searchHistory,
    removeFromHistory,
  } = useSearchState();

  const {
    notices,
    totalCount,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useSearchNotices({
    submittedQuery,
    dateRange,
    boardCodes: selectedBoards,
  });

  const { ref: loadMoreRef, inView } = useInView({
    rootMargin: '0px 0px 400px 0px',
    threshold: 0,
  });

  useEffect(() => {
    if (!inView || !hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSelectHistory = (term: string) => {
    submitQuery(term);
  };

  const handleNoticeClick = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    notice: Notice,
  ) => {
    if (isLoggedIn) {
      incrementNoticeView(notice.id).catch(() => {});
    }
    if (Capacitor.isNativePlatform()) {
      e.preventDefault();
      try {
        await openUrl(notice.link);
      } catch {
        window.open(notice.link, '_blank', 'noreferrer');
      }
    }
  };

  const showHistory = submittedQuery.length === 0 && query.length === 0;
  const showResults = submittedQuery.length >= 1;

  return (
    <div className="flex h-full flex-col bg-white">
      {/* 헤더 */}
      <div className="shrink-0 px-4 pb-1">
        <div className="pt-safe md:pt-0" />
        <div className="relative mt-4 flex items-center justify-center md:mt-4">
          <button
            onClick={goBack}
            className="absolute left-0 z-10 group -ml-1 rounded-full p-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95"
            aria-label="뒤로가기"
          >
            <FiArrowLeft size={22} className="transition-transform group-hover:-translate-x-0.5" />
          </button>
          <h1 className="text-base font-bold text-gray-800">공지 검색</h1>
        </div>
      </div>

      {/* 검색 입력 */}
      <div className="shrink-0">
        <SearchInput
          value={query}
          onChange={setQuery}
          onSubmit={submitQuery}
        />
      </div>

      {/* 필터 */}
      <div className="shrink-0">
        <SearchFilters
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          selectedBoards={selectedBoards}
          onBoardsChange={setSelectedBoards}
        />
      </div>

      {/* 컨텐츠 영역 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {showHistory && (
          <SearchHistory
            history={searchHistory}
            onSelect={handleSelectHistory}
            onRemove={removeFromHistory}
          />
        )}

        {showResults && (
          <>
            {/* 로딩 */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
              </div>
            )}

            {/* 결과 헤더 */}
            {!isLoading && (
              <SearchResultHeader totalCount={totalCount} />
            )}

            {/* 결과 없음 */}
            {!isLoading && notices.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm font-medium text-gray-500">검색 결과가 없어요</p>
                <p className="mt-1 text-xs text-gray-400">다른 검색어나 필터를 시도해보세요</p>
              </div>
            )}

            {/* 검색 결과 목록 */}
            {!isLoading && notices.length > 0 && (
              <div role="list" className="divide-y divide-gray-100 md:space-y-2 md:divide-y-0 md:px-4 md:py-2">
                {notices.map((notice) => (
                  <div
                    key={notice.id}
                    role="listitem"
                    className="bg-white transition-all hover:bg-gray-50 md:rounded-xl md:border md:border-gray-100 md:shadow-sm md:hover:-translate-y-0.5 md:hover:shadow-md"
                  >
                    <a
                      href={notice.link}
                      target="_blank"
                      rel="noreferrer"
                      className="block p-5"
                      onClick={(e) => handleNoticeClick(e, notice)}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <CategoryBadge boardCode={notice.board_code} />
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          {dayjs(notice.date).format('YYYY-MM-DD')}
                        </span>
                      </div>
                      <h3 className="text-[15px] font-medium leading-snug text-gray-900">
                        <HighlightedTitle title={notice.title} query={submittedQuery} />
                      </h3>
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* 무한 스크롤 트리거 */}
            {hasNextPage && (
              <div ref={loadMoreRef} className="py-4 text-center">
                {isFetchingNextPage ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                    <span>불러오는 중...</span>
                  </div>
                ) : null}
              </div>
            )}

            {!hasNextPage && notices.length > 0 && !isLoading && (
              <div className="py-8 text-center text-sm text-gray-400">
                모든 검색 결과를 불러왔어요
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
