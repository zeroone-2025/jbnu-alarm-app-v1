import { useState, useEffect } from 'react';
import { Notice, getKeywordNotices, getMyKeywords } from '@/_lib/api';
import { getLatestKeywordNoticeAt } from '@/_lib/utils/notice';

/**
 * 키워드 공지 알림 카운트만 관리하는 경량 훅 (SharedHeader용)
 * filter 파라미터 없이 동작하여 모든 메인 페이지에서 사용 가능
 */
export function useKeywordNotices(isLoggedIn: boolean) {
  const [keywordNotices, setKeywordNotices] = useState<Notice[]>([]);
  const [keywordCount, setKeywordCount] = useState<number | null>(null);
  const [hasNewKeywordNotices, setHasNewKeywordNotices] = useState(false);
  const [newKeywordCount, setNewKeywordCount] = useState(0);

  const loadKeywordNotices = async () => {
    try {
      const data = await getKeywordNotices(0, 200, true);
      setKeywordNotices(data);
    } catch (error) {
      console.error('Failed to load keyword notices', error);
    }
  };

  const loadKeywordNoticesSilent = async () => {
    try {
      const data = await getKeywordNotices(0, 200, true);
      setKeywordNotices(data);
    } catch (error) {
      console.error('Failed to load keyword notices', error);
    }
  };

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

    const newCount = items.filter(notice => {
      const noticeTime = new Date(notice.created_at ?? notice.date).getTime();
      return noticeTime > seenTime;
    }).length;

    setNewKeywordCount(newCount);
  };

  const markKeywordNoticesSeen = (items: Notice[]) => {
    if (typeof window === 'undefined') return;
    const latest = getLatestKeywordNoticeAt(items);
    if (!latest) return;
    localStorage.setItem('keyword_notice_seen_at', new Date(latest).toISOString());
    setHasNewKeywordNotices(false);
    setNewKeywordCount(0);
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

  // 키워드 공지 배지 업데이트
  useEffect(() => {
    if (!isLoggedIn) {
      setHasNewKeywordNotices(false);
      return;
    }
    updateKeywordBadge(keywordNotices);
  }, [keywordNotices, isLoggedIn]);

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
