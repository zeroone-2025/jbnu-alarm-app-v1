'use client';

import { createContext, useContext, useState, useEffect, useRef, Dispatch, SetStateAction, ReactNode } from 'react';
import { Notice, getKeywordNotices, getMyKeywords } from '@/_lib/api';
import { getLatestKeywordNoticeAt } from '@/_lib/utils/notice';
import { useUser } from '@/_lib/hooks/useUser';

interface NotificationBadgeContextType {
  keywordNotices: Notice[];
  keywordCount: number | null;
  newKeywordCount: number;
  hasNewKeywordNotices: boolean;
  refreshKeywordNotices: () => Promise<void>;
  markKeywordNoticesSeen: (items: Notice[]) => void;
  setKeywordNotices: Dispatch<SetStateAction<Notice[]>>;
}

const NotificationBadgeContext = createContext<NotificationBadgeContextType | null>(null);

export function NotificationBadgeProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useUser();
  const [keywordNotices, setKeywordNotices] = useState<Notice[]>([]);
  const [keywordCount, setKeywordCount] = useState<number | null>(null);
  const [hasNewKeywordNotices, setHasNewKeywordNotices] = useState(false);
  const [newKeywordCount, setNewKeywordCount] = useState(0);

  // 레이스 컨디션 방어: markSeen 후 2초 이내 배지 재계산 스킵
  const _badgeClearedAt = useRef<number>(0);

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

  const loadKeywordNoticesSilent = async () => {
    try {
      const data = await getKeywordNotices(0, 200, true);
      setKeywordNotices(data);
    } catch (error) {
      console.error('Failed to load keyword notices', error);
    }
  };

   const refreshKeywordNotices = async () => {
     try {
       const keywords = await getMyKeywords();
       setKeywordCount(keywords.length);
       if (keywords.length === 0) {
         setKeywordNotices([]);
         return;
       }
       const data = await getKeywordNotices(0, 200, true);
       setKeywordNotices(data);
     } catch (error) {
       console.error('Failed to refresh keyword notices', error);
     }
   };

  const updateKeywordBadge = (items: Notice[]) => {
    if (typeof window === 'undefined') return;

    // 레이스 컨디션 방어: markSeen 후 2초 이내면 스킵
    if (Date.now() - _badgeClearedAt.current < 2000) return;

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
     const seenTime = seenAt ? new Date(seenAt).getTime() : 0;
     if (isNaN(seenTime)) {
       // localStorage 오염 방어: 잘못된 값이면 모든 공지를 새 알림으로 처리
       setHasNewKeywordNotices(true);
       setNewKeywordCount(items.length);
       return;
     }
     setHasNewKeywordNotices(latest > seenTime);

    const newCount = items.filter(notice => {
      const noticeTime = new Date(notice.created_at ?? notice.date).getTime();
      return noticeTime > seenTime;
    }).length;

    setNewKeywordCount(newCount);
  };

  const markKeywordNoticesSeen = (items: Notice[]) => {
    if (typeof window === 'undefined') return;

    // 빈 배열 fallback: 지금까지 본 것으로 처리
    if (items.length === 0) {
      localStorage.setItem('keyword_notice_seen_at', new Date().toISOString());
      setNewKeywordCount(0);
      setHasNewKeywordNotices(false);
      _badgeClearedAt.current = Date.now();
      return;
    }

    const latest = getLatestKeywordNoticeAt(items);
    if (!latest) return; // 데이터 있는데 null이면 실제 버그 → 그냥 return

    localStorage.setItem('keyword_notice_seen_at', new Date(latest).toISOString());
    setHasNewKeywordNotices(false);
    setNewKeywordCount(0);
    _badgeClearedAt.current = Date.now();
  };

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
      setNewKeywordCount(0);
      setHasNewKeywordNotices(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      setHasNewKeywordNotices(false);
      setNewKeywordCount(0);
      return;
    }
    updateKeywordBadge(keywordNotices);
  }, [keywordNotices, isLoggedIn]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isLoggedIn) {
        refreshKeywordNotices();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isLoggedIn]);

  return (
    <NotificationBadgeContext.Provider
      value={{
        keywordNotices,
        keywordCount,
        newKeywordCount,
        hasNewKeywordNotices,
        refreshKeywordNotices,
        markKeywordNoticesSeen,
        setKeywordNotices,
      }}
    >
      {children}
    </NotificationBadgeContext.Provider>
  );
}

export function useNotificationBadge() {
  const ctx = useContext(NotificationBadgeContext);
  if (!ctx) throw new Error('useNotificationBadge must be used within NotificationBadgeProvider');
  return ctx;
}
