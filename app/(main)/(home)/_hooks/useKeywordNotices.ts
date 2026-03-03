import { useState, useEffect, useCallback } from 'react';
import { Notice, getAllKeywordNotices, getMyKeywords } from '@/_lib/api';
import { getLatestKeywordNoticeAt } from '@/_lib/utils/notice';
import { FilterType } from '@/_types/filter';

const KEYWORD_SEEN_EVENT = 'keyword-notices-seen';

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
      const data = await getAllKeywordNotices(true);
      setKeywordNotices(data);
    } catch (error) {
      console.error('Failed to load keyword notices', error);
    }
  };

  // 키워드 공지 로딩 (백그라운드, 에러 무시)
  const loadKeywordNoticesSilent = async () => {
    try {
      const data = await getAllKeywordNotices(true);
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
  const updateKeywordBadge = useCallback((items: Notice[]) => {
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
      const unreadCount = items.filter(n => !n.is_read).length;
      if (unreadCount > 0) {
        // 읽지 않은 매칭 공지가 있으면 "새 알림 있음"으로 표시
        setHasNewKeywordNotices(true);
        setNewKeywordCount(unreadCount);
        // seenAt은 사용자가 KEYWORD 탭에 실제로 진입했을 때만 설정
        // (markKeywordNoticesSeen에서 처리)
      } else {
        localStorage.setItem('keyword_notice_seen_at', new Date().toISOString());
        setHasNewKeywordNotices(false);
        setNewKeywordCount(0);
      }
      return;
    }

    const seenTime = new Date(seenAt).getTime();

    // 새 알림 = seenTime 이후 생성 + 아직 읽지 않은 공지만
    const newCount = items.filter(notice => {
      if (notice.is_read) return false;
      const noticeTime = new Date(notice.created_at ?? notice.date).getTime();
      return noticeTime > seenTime;
    }).length;

    setHasNewKeywordNotices(newCount > 0);
    setNewKeywordCount(newCount);
  }, []);

  // 키워드 공지 읽음 처리
  const markKeywordNoticesSeen = (items: Notice[]) => {
    if (typeof window === 'undefined') return;
    const latest = getLatestKeywordNoticeAt(items);
    if (!latest) return;
    localStorage.setItem('keyword_notice_seen_at', new Date(latest).toISOString());
    setHasNewKeywordNotices(false);
    setNewKeywordCount(0);
    // 다른 훅 인스턴스에 알림
    window.dispatchEvent(new Event(KEYWORD_SEEN_EVENT));
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
  }, [keywordNotices, isLoggedIn, updateKeywordBadge]);

  // 다른 훅 인스턴스에서 seen 처리 시 배지 재계산
  useEffect(() => {
    const handleSeen = () => updateKeywordBadge(keywordNotices);
    window.addEventListener(KEYWORD_SEEN_EVENT, handleSeen);
    return () => window.removeEventListener(KEYWORD_SEEN_EVENT, handleSeen);
  }, [keywordNotices, updateKeywordBadge]);

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
