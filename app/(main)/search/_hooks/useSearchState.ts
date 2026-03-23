'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

import { useSearchParams } from 'next/navigation';

export type DateRange = '1w' | '1m' | '3m' | 'all';

const HISTORY_KEY = 'search_history';
const MAX_HISTORY = 8;

function loadHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(items: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
}

export function useSearchState() {
  const searchParams = useSearchParams();

  // 입력 중인 쿼리
  const [query, setQuery] = useState<string>(() => searchParams.get('q') ?? '');
  // Enter 확정된 쿼리
  const [submittedQuery, setSubmittedQuery] = useState<string>(() => searchParams.get('q') ?? '');
  // 디바운스된 쿼리 (UI용)
  const [debouncedQuery, setDebouncedQuery] = useState<string>(query);

  const [dateRange, setDateRange] = useState<DateRange>(
    () => (searchParams.get('period') as DateRange) ?? 'all',
  );
  const [selectedBoards, setSelectedBoards] = useState<string[]>(() => {
    const raw = searchParams.get('boards');
    return raw ? raw.split(',').filter(Boolean) : [];
  });

  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // 클라이언트 마운트 후 localStorage에서 히스토리 로드
  useEffect(() => {
    setSearchHistory(loadHistory());
  }, []);

  // 300ms 디바운스
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  // URL 동기화
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (submittedQuery) params.set('q', submittedQuery);
    if (dateRange !== 'all') params.set('period', dateRange);
    if (selectedBoards.length > 0) params.set('boards', selectedBoards.join(','));
    const qs = params.toString();
    const next = qs ? `/search?${qs}` : '/search';
    const current = `${window.location.pathname}${window.location.search}`;
    if (next !== current) {
      window.history.replaceState(null, '', next);
    }
  }, [submittedQuery, dateRange, selectedBoards]);

  const submitQuery = useCallback((q: string) => {
    const trimmed = q.trim();
    setQuery(trimmed);
    setDebouncedQuery(trimmed);
    setSubmittedQuery(trimmed);
    if (trimmed) {
      addToHistory(trimmed);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToHistory = useCallback((term: string) => {
    setSearchHistory((prev) => {
      const filtered = prev.filter((h) => h !== term);
      const next = [term, ...filtered].slice(0, MAX_HISTORY);
      saveHistory(next);
      return next;
    });
  }, []);

  const removeFromHistory = useCallback((term: string) => {
    setSearchHistory((prev) => {
      const next = prev.filter((h) => h !== term);
      saveHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    saveHistory([]);
    setSearchHistory([]);
  }, []);

  return {
    query,
    setQuery,
    debouncedQuery,
    submittedQuery,
    submitQuery,
    dateRange,
    setDateRange,
    selectedBoards,
    setSelectedBoards,
    searchHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}
