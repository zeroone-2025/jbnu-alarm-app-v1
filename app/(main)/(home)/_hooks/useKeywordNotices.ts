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
  const [newKeywordCount, setNewKeywordCount] = useState(0);

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
      setNewKeywordCount(0);
      return;
    }
    const latest = getLatestKeywordNoticeAt(items);
    if (!latest) {
      setHasNewKeywordNotices(false);
      setNewKeywordCount(0);
      return;
    }
    const seenAt = localStorage.getItem('keyword_notice_seen_at');
    if (!seenAt) {
      // 처음 접속하거나 이력이 없을 때는 현재 목록을 모두 '이미 본 것'으로 간주하거나 현재 시간으로 초기화
      // 사용자 요청: 크롤러 추가 시점(00:00) 이후의 것만 알림으로 받고 싶어함.
      // 백엔드에서 이미 키워드 추가 시점 이후의 공지만 주므로, 
      // 여기서 seenAt을 설치 시점(현재 최신 공지의 시각 또는 현재 시각)으로 잡으면
      // 이후에 새로 들어오는 공지만 '새 알림'이 됨.
      if (items.length > 0) {
        localStorage.setItem('keyword_notice_seen_at', new Date(latest).toISOString());
      } else {
        localStorage.setItem('keyword_notice_seen_at', new Date().toISOString());
      }
      setHasNewKeywordNotices(false);
      setNewKeywordCount(0);
      return;
    }

    const seenTime = new Date(seenAt).getTime();
    setHasNewKeywordNotices(latest > seenTime);

    // 새 알림 개수 계산 (seenTime보다 나중에 생성된 공지들)
    const newCount = items.filter(notice => {
      const noticeTime = new Date(notice.created_at ?? notice.date).getTime();
      return noticeTime > seenTime;
    }).length;

    setNewKeywordCount(newCount);
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
    } else {
      setKeywordNotices([]);
      setKeywordCount(null);
    }
  }, [isLoggedIn]);

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
    newKeywordCount,
    loadKeywordNotices,
    loadKeywordNoticesSilent,
    loadKeywordCount,
    markKeywordNoticesSeen,
    setKeywordNotices,
  };
}
