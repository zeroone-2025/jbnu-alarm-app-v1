'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

import { searchNotices } from '@/_lib/api/notices';
import type { Notice } from '@/_types/notice';

import type { DateRange } from './useSearchState';

interface UseSearchNoticesParams {
  submittedQuery: string;
  dateRange: DateRange;
  boardCodes: string[];
}

export function useSearchNotices({
  submittedQuery,
  dateRange,
  boardCodes,
}: UseSearchNoticesParams) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['notices', 'search', { query: submittedQuery, dateRange, boardCodes }],
    queryFn: ({ pageParam }) =>
      searchNotices(
        submittedQuery,
        pageParam as string | null,
        20,
        dateRange,
        boardCodes.length > 0 ? boardCodes : undefined,
      ),
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    initialPageParam: null as string | null,
    enabled: submittedQuery.length >= 1,
    staleTime: 1000 * 60 * 5, // 5분
  });

  const notices: Notice[] = data?.pages.flatMap((p) => p.items) ?? [];
  const totalCount: number = data?.pages[0]?.total_count ?? 0;

  return {
    notices,
    totalCount,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
  };
}
