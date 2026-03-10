'use client';

import { createContext, useContext, useState, useEffect, useRef, Dispatch, SetStateAction, ReactNode } from 'react';
import { Notice, getKeywordNotices, getMyKeywords } from '@/_lib/api';
import { getLatestKeywordNoticeAt } from '@/_lib/utils/notice';
import { useUser } from '@/_lib/hooks/useUser';
import { useUserStore } from '@/_lib/store/useUserStore';
import { updateUserProfile } from '@/_lib/api/user';
import { getQueryClient } from '@/providers';

// Normalize datetime to 3 decimal places (milliseconds) for cross-browser safety
function normalizeDateTime(s: string): string {
  return s.replace(/(\.\d{3})\d+/, '$1');
}

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
  const keywordNoticesRef = useRef<Notice[]>([]);

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
      const user = useUserStore.getState().user;
      const serverSeenAt = user?.keyword_notice_seen_at ?? null;
      const localSeenAt = localStorage.getItem('keyword_notice_seen_at');
      const seenAt = serverSeenAt ?? localSeenAt;
      const seenTime = seenAt ? new Date(normalizeDateTime(seenAt)).getTime() : 0;
     if (isNaN(seenTime)) {
       // localStorage 오염 방어: 잘못된 값이면 모든 공지를 새 알림으로 처리
       setHasNewKeywordNotices(true);
       setNewKeywordCount(items.length);
       return;
     }
     setHasNewKeywordNotices(latest > seenTime);

     const newCount = items.filter(notice => {
       const noticeTime = new Date(normalizeDateTime(notice.created_at ?? notice.date)).getTime();
       return noticeTime > seenTime;
     }).length;

    setNewKeywordCount(newCount);
  };

  const markKeywordNoticesSeen = (items: Notice[]) => {
    if (typeof window === 'undefined') return;

    // 빈 배열 fallback: 지금까지 본 것으로 처리
    if (items.length === 0) {
      const prevSeenAt = localStorage.getItem('keyword_notice_seen_at');
      const timestamp = new Date().toISOString();
      localStorage.setItem('keyword_notice_seen_at', timestamp);
      setNewKeywordCount(0);
      setHasNewKeywordNotices(false);
      _badgeClearedAt.current = Date.now();
      updateUserProfile({ keyword_notice_seen_at: timestamp })
        .then((updatedUser) => {
          useUserStore.getState().setUser(updatedUser);
          getQueryClient()?.setQueryData(['user', 'profile'], updatedUser);
        })
        .catch(() => {
          if (prevSeenAt !== null) {
            localStorage.setItem('keyword_notice_seen_at', prevSeenAt);
          } else {
            localStorage.removeItem('keyword_notice_seen_at');
          }
          updateKeywordBadge(keywordNoticesRef.current);
        });
      return;
    }

    const latest = getLatestKeywordNoticeAt(items);
    if (!latest) return; // 데이터 있는데 null이면 실제 버그 → 그냥 return

    const prevSeenAt = localStorage.getItem('keyword_notice_seen_at');
    const timestamp = new Date(latest).toISOString();
    localStorage.setItem('keyword_notice_seen_at', timestamp);
    setHasNewKeywordNotices(false);
    setNewKeywordCount(0);
    _badgeClearedAt.current = Date.now();
    updateUserProfile({ keyword_notice_seen_at: timestamp })
      .then((updatedUser) => {
        useUserStore.getState().setUser(updatedUser);
        getQueryClient()?.setQueryData(['user', 'profile'], updatedUser);
      })
      .catch(() => {
        if (prevSeenAt !== null) {
          localStorage.setItem('keyword_notice_seen_at', prevSeenAt);
        } else {
          localStorage.removeItem('keyword_notice_seen_at');
        }
        updateKeywordBadge(keywordNoticesRef.current);
      });
  };

  useEffect(() => {
    keywordNoticesRef.current = keywordNotices;
  }, [keywordNotices]);

  useEffect(() => {
    if (isLoggedIn) {
      const user = useUserStore.getState().user;
      if (user?.keyword_notice_seen_at) {
        localStorage.setItem('keyword_notice_seen_at', user.keyword_notice_seen_at);
      } else {
        localStorage.removeItem('keyword_notice_seen_at');
      }
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
