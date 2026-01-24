import { useState, useEffect } from 'react';
import { Notice, getKeywordNotices, getMyKeywords } from '@/_lib/api';
import { getLatestKeywordNoticeAt } from '@/_lib/utils/notice';
import { FilterType } from '@/_types/filter';

/**
 * 키워드 공지사항 관련 로직을 관리하는 Hook
 * - 키워드 공지 로딩
 * - 키워드 개수 관리
 * - 새 키워드 공지 배지 표시 여부
 */
export function useKeywordNotices(isLoggedIn: boolean, filter: FilterType) {
  const [keywordNotices, setKeywordNotices] = useState<Notice[]>([]);
  const [keywordCount, setKeywordCount] = useState<number | null>(null);
  const [hasNewKeywordNotices, setHasNewKeywordNotices] = useState(false);

  // 키워드 공지 로딩
  const loadKeywordNotices = async () => {
    try {
      const data = await getKeywordNotices(0, 200, true);
      setKeywordNotices(data);
    } catch (error) {
      console.error('Failed to load keyword notices', error);
    }
  };

  // 키워드 공지 로딩 (백그라운드, 에러 무시)
  const loadKeywordNoticesSilent = async () => {
    try {
      const data = await getKeywordNotices(0, 200, true);
      setKeywordNotices(data);
    } catch (error) {
      console.error('Failed to load keyword notices', error);
    }
  };

  // 키워드 개수 로딩
  const loadKeywordCount = async () => {
    try {
      const data = await getMyKeywords();
      const count = data.length;
      setKeywordCount(count);
      return count;
    } catch (error) {
      console.error('Failed to load keywords', error);
      setKeywordCount(0);
      return 0;
    }
  };

  // 새 키워드 공지 배지 업데이트
  const updateKeywordBadge = (items: Notice[]) => {
    if (typeof window === 'undefined') return;
    if (items.length === 0) {
      setHasNewKeywordNotices(false);
      return;
    }
    const latest = getLatestKeywordNoticeAt(items);
    if (!latest) {
      setHasNewKeywordNotices(false);
      return;
    }
    const seenAt = localStorage.getItem('keyword_notice_seen_at');
    if (!seenAt) {
      setHasNewKeywordNotices(true);
      return;
    }
    setHasNewKeywordNotices(latest > new Date(seenAt).getTime());
  };

  // 키워드 공지 읽음 처리
  const markKeywordNoticesSeen = (items: Notice[]) => {
    if (typeof window === 'undefined') return;
    const latest = getLatestKeywordNoticeAt(items);
    if (!latest) return;
    localStorage.setItem('keyword_notice_seen_at', new Date(latest).toISOString());
    setHasNewKeywordNotices(false);
  };

  // 초기화: 로그인 시 키워드 공지 로드
  useEffect(() => {
    if (isLoggedIn) {
      (async () => {
        const count = await loadKeywordCount();
        if (count > 0) {
          await loadKeywordNoticesSilent();
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 키워드 필터 진입 시 공지 로드
  useEffect(() => {
    if (filter === 'KEYWORD' && isLoggedIn) {
      (async () => {
        const count = await loadKeywordCount();
        if (count === 0) {
          setKeywordNotices([]);
          return;
        }
        await loadKeywordNotices();
      })();
    }
  }, [filter, isLoggedIn]);

  // 키워드 공지 배지 업데이트
  useEffect(() => {
    if (!isLoggedIn) {
      setHasNewKeywordNotices(false);
      return;
    }
    updateKeywordBadge(keywordNotices);
  }, [keywordNotices, isLoggedIn]);

  // 키워드 필터 진입 시 읽음 처리
  useEffect(() => {
    if (filter === 'KEYWORD') {
      markKeywordNoticesSeen(keywordNotices);
    }
  }, [filter, keywordNotices]);

  return {
    keywordNotices,
    keywordCount,
    hasNewKeywordNotices,
    loadKeywordNotices,
    loadKeywordNoticesSilent,
    loadKeywordCount,
    markKeywordNoticesSeen,
    setKeywordNotices,
  };
}
