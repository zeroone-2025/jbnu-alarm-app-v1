import { useState, useEffect, useRef, RefObject, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { FilterType, isLoginRequiredFilter } from '@/_types/filter';

interface UseFilterStateOptions {
  isLoggedIn: boolean;
  isAuthLoaded: boolean;
  isMounted: boolean;
  scrollContainerRef: RefObject<HTMLDivElement>;
}

const FILTER_STORAGE_KEY = 'current_filter';

/**
 * 필터 상태와 localStorage/URL 동기화, 스크롤 위치 관리를 담당하는 Hook
 */
export function useFilterState({ isLoggedIn, isAuthLoaded, isMounted, scrollContainerRef }: UseFilterStateOptions) {
  const searchParams = useSearchParams();
  
  // URL에서 초기 필터 가져오기 (동기적)
  const getInitialFilter = useCallback((): FilterType => {
    const urlFilterRaw = searchParams.get('filter');
    if (urlFilterRaw) {
      return urlFilterRaw.toUpperCase() as FilterType;
    }
    return 'ALL';
  }, [searchParams]);

  const [filter, setFilterState] = useState<FilterType>(getInitialFilter());
  const scrollPositionsRef = useRef<Record<string, number>>({});
  const lastFilterRef = useRef<string | null>(null);

  // localStorage에서 필터 로드 (마운트 시 한 번만 실행)
  useEffect(() => {
    // URL에 필터가 없을 때만 localStorage 확인
    const params = new URLSearchParams(window.location.search);
    if (params.get('filter')) return;

    const storedFilter = localStorage.getItem(FILTER_STORAGE_KEY) as FilterType | null;
    if (storedFilter && storedFilter !== filter) {
      setFilterState(storedFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 초기 필터 검증 및 동기화 (로그인 체크)
  useEffect(() => {
    if (!isAuthLoaded) return;
    
    if (isLoginRequiredFilter(filter) && !isLoggedIn) {
      setFilterState('ALL');
      if (typeof window !== 'undefined') {
        localStorage.setItem(FILTER_STORAGE_KEY, 'ALL');
      }
    }
  }, [isAuthLoaded, isLoggedIn, filter]);

  // filter 변경 시 localStorage 저장
  const setFilter = (newFilter: FilterType) => {
    setFilterState(newFilter);
    if (typeof window !== 'undefined') {
      localStorage.setItem(FILTER_STORAGE_KEY, newFilter);
    }
  };

  // 현재 필터를 URL에 반영 (공유/북마크 지원)
  useEffect(() => {
    if (!isMounted) return;
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (filter === 'ALL') {
      params.delete('filter');
    } else {
      // URL에 쓸 때 소문자로 변환
      params.set('filter', filter.toLowerCase());
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
