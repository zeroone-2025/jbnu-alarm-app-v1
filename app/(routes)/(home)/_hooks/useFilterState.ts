import { useState, useEffect, useRef, RefObject } from 'react';
import { FilterType, isLoginRequiredFilter } from '@/_types/filter';

interface UseFilterStateOptions {
  isLoggedIn: boolean;
  isMounted: boolean;
  scrollContainerRef: RefObject<HTMLDivElement>;
}

/**
 * 필터 상태와 URL 동기화, 스크롤 위치 관리를 담당하는 Hook
 * - URL 쿼리 파라미터 읽기/쓰기
 * - 비로그인 시 제한된 필터 방어
 * - 필터 변경 시 스크롤 위치 저장/복원 (즐겨찾기는 항상 최상단)
 */
export function useFilterState({ isLoggedIn, isMounted, scrollContainerRef }: UseFilterStateOptions) {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const scrollPositionsRef = useRef<Record<string, number>>({});
  const lastFilterRef = useRef<string | null>(null);

  // URL 쿼리에서 초기 필터 읽기 (CSR 전용)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('filter') as FilterType | null;
    if (initial) {
      setFilter(initial);
    }
  }, []);

  // 비로그인 상태에서는 제한된 필터로 진입하지 않도록 방어
  useEffect(() => {
    if (!isMounted) return;
    if (!isLoggedIn && isLoginRequiredFilter(filter)) {
      setFilter('ALL');
    }
  }, [filter, isLoggedIn, isMounted]);

  // 현재 필터를 URL에 반영 (새로고침 시 상태 유지)
  useEffect(() => {
    if (!isMounted) return;
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (filter === 'ALL') {
      params.delete('filter');
    } else {
      params.set('filter', filter);
    }
    const query = params.toString();
    const nextUrl = query ? `/?${query}` : '/';
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (nextUrl !== currentUrl) {
      window.history.replaceState(null, '', nextUrl);
    }
  }, [filter, isMounted]);

  // 필터 이동 시 스크롤 위치 저장/복원 (즐겨찾기 진입은 항상 최상단)
  useEffect(() => {
    if (!isMounted) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const lastFilter = lastFilterRef.current;
    if (lastFilter) {
      scrollPositionsRef.current[lastFilter] = container.scrollTop;
    }

    requestAnimationFrame(() => {
      if (filter === 'FAVORITE') {
        container.scrollTo({ top: 0, behavior: 'auto' });
        return;
      }

      const savedTop = scrollPositionsRef.current[filter];
      if (typeof savedTop === 'number') {
        container.scrollTo({ top: savedTop, behavior: 'auto' });
      }
    });

    lastFilterRef.current = filter;
  }, [filter, isMounted, scrollContainerRef]);

  return { filter, setFilter };
}
