import { useState, useEffect, useRef, RefObject } from 'react';
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
 * - localStorage: 메인 저장소 (페이지 이동 시에도 유지)
 * - URL: 공유/북마크 지원 (보조)
 * - 비로그인 시 제한된 필터 방어
 * - 필터 변경 시 스크롤 위치 저장/복원 (즐겨찾기는 항상 최상단)
 */
export function useFilterState({ isLoggedIn, isAuthLoaded, isMounted, scrollContainerRef }: UseFilterStateOptions) {
  const [filter, setFilterState] = useState<FilterType>('ALL');
  const scrollPositionsRef = useRef<Record<string, number>>({});
  const lastFilterRef = useRef<string | null>(null);

  // 초기 필터 로드 (localStorage → URL 순서)
  useEffect(() => {
    if (!isAuthLoaded) return; // 인증 상태 로드 완료 대기
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const urlFilterRaw = params.get('filter');
    // URL에서 읽을 때 대문자로 변환
    const urlFilter = urlFilterRaw ? (urlFilterRaw.toUpperCase() as FilterType) : null;
    const storedFilter = localStorage.getItem(FILTER_STORAGE_KEY) as FilterType | null;
    
    // 우선순위: URL > localStorage > 기본값('ALL')
    const initialFilter = urlFilter || storedFilter || 'ALL';
    
    // 로그인 체크
    if (isLoginRequiredFilter(initialFilter) && !isLoggedIn) {
      setFilterState('ALL');
      localStorage.setItem(FILTER_STORAGE_KEY, 'ALL');
    } else {
      setFilterState(initialFilter);
      localStorage.setItem(FILTER_STORAGE_KEY, initialFilter);
    }
  }, [isAuthLoaded, isLoggedIn]);

  // 비로그인 상태에서는 제한된 필터로 진입하지 않도록 방어
  useEffect(() => {
    if (!isMounted || !isAuthLoaded) return; // 인증 로드 완료 후에만 체크
    if (!isLoggedIn && isLoginRequiredFilter(filter)) {
      setFilterState('ALL');
      localStorage.setItem(FILTER_STORAGE_KEY, 'ALL');
    }
  }, [filter, isLoggedIn, isAuthLoaded, isMounted]);

  // filter 변경 시 localStorage와 URL 동기화
  const setFilter = (newFilter: FilterType) => {
    setFilterState(newFilter);
    
    // localStorage에 저장
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
