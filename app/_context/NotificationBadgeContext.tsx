'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback, Dispatch, SetStateAction, ReactNode } from 'react';
import { API_BASE_URL, Notice, getKeywordNotices, getMyKeywords } from '@/_lib/api';
import { getLatestKeywordNoticeAt } from '@/_lib/utils/notice';
import { useUser } from '@/_lib/hooks/useUser';
import { useUserStore } from '@/_lib/store/useUserStore';
import { updateUserProfile } from '@/_lib/api/user';
import { getAccessToken } from '@/_lib/auth/tokenStore';
import { getQueryClient } from '@/providers';
import persistentStorage from '@/_lib/utils/persistentStorage';

const SEEN_AT_KEY = 'keyword_notice_seen_at';

// Normalize datetime to 3 decimal places (milliseconds) for cross-browser safety
export function normalizeDateTime(s: string): string {
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

  // seenAt ref — persistentStorage.getSync()로 동기 읽기 가능 (init() 후 캐시에 있음)
  const seenAtRef = useRef<string | null>(null);

  // 레이스 컨디션 방어: markSeen 후 2초 이내 배지 재계산 스킵
  const _badgeClearedAt = useRef<number>(0);
  const _syncPending = useRef(false);

  // seenAtRef를 persistentStorage와 동기화
  const syncSeenAt = useCallback((value: string | null) => {
    seenAtRef.current = value;
    if (value !== null) {
      persistentStorage.set(SEEN_AT_KEY, value).catch(() => {});
    } else {
      persistentStorage.remove(SEEN_AT_KEY).catch(() => {});
    }
  }, []);

  // 초기화: persistentStorage 캐시에서 seenAt 로드
  useEffect(() => {
    seenAtRef.current = persistentStorage.getSync(SEEN_AT_KEY);
  }, []);

  const loadKeywordCount = useCallback(async () => {
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
  }, []);

  const loadKeywordNoticesSilent = useCallback(async () => {
    try {
      const data = await getKeywordNotices(0, 200, true);
      setKeywordNotices(data);
    } catch (error) {
      console.error('Failed to load keyword notices', error);
    }
  }, []);

  const refreshKeywordNotices = useCallback(async () => {
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
  }, []);

  const updateKeywordBadge = useCallback((items: Notice[]) => {
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
    const localSeenAt = seenAtRef.current;
    let seenAt: string | null = null;
    if (serverSeenAt && localSeenAt) {
      const serverTime = new Date(normalizeDateTime(serverSeenAt)).getTime();
      const localTime = new Date(normalizeDateTime(localSeenAt)).getTime();
      seenAt = serverTime > localTime ? serverSeenAt : localSeenAt;
    } else {
      seenAt = serverSeenAt ?? localSeenAt;
    }
    const seenTime = seenAt ? new Date(normalizeDateTime(seenAt)).getTime() : 0;
    if (isNaN(seenTime)) {
      // 오염된 값이면 모든 공지를 새 알림으로 처리
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
  }, []);

  const markKeywordNoticesSeen = (items: Notice[]) => {
    if (typeof window === 'undefined') return;

    // 빈 배열 fallback: 지금까지 본 것으로 처리
    if (items.length === 0) {
      const prevSeenAt = seenAtRef.current;
      const timestamp = new Date().toISOString();
      syncSeenAt(timestamp);
      setNewKeywordCount(0);
      setHasNewKeywordNotices(false);
      _badgeClearedAt.current = Date.now();
      _syncPending.current = true;
      updateUserProfile({ keyword_notice_seen_at: timestamp })
        .then((updatedUser) => {
          _syncPending.current = false;
          useUserStore.getState().setUser(updatedUser);
          getQueryClient()?.setQueryData(['user', 'profile'], updatedUser);
        })
        .catch(() => {
          if (prevSeenAt !== null) {
            syncSeenAt(prevSeenAt);
          }
          updateKeywordBadge(keywordNoticesRef.current);
        });
      return;
    }

    const latest = getLatestKeywordNoticeAt(items);
    if (!latest) return; // 데이터 있는데 null이면 실제 버그 → 그냥 return

    const prevSeenAt = seenAtRef.current;
    const timestamp = new Date(latest).toISOString();
    syncSeenAt(timestamp);
    setHasNewKeywordNotices(false);
    setNewKeywordCount(0);
    _badgeClearedAt.current = Date.now();
    _syncPending.current = true;
    updateUserProfile({ keyword_notice_seen_at: timestamp })
      .then((updatedUser) => {
        _syncPending.current = false;
        useUserStore.getState().setUser(updatedUser);
        getQueryClient()?.setQueryData(['user', 'profile'], updatedUser);
      })
      .catch(() => {
        if (prevSeenAt !== null) {
          syncSeenAt(prevSeenAt);
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
      const serverSeenAt = user?.keyword_notice_seen_at ?? null;
      const localSeenAt = seenAtRef.current;

      if (serverSeenAt && localSeenAt) {
        const serverTime = new Date(normalizeDateTime(serverSeenAt)).getTime();
        const localTime = new Date(normalizeDateTime(localSeenAt)).getTime();
        if (!isNaN(serverTime) && !isNaN(localTime)) {
          const winner = serverTime > localTime ? serverSeenAt : localSeenAt;
          syncSeenAt(winner);
        } else if (!isNaN(serverTime)) {
          syncSeenAt(serverSeenAt);
        } else if (!isNaN(localTime)) {
          syncSeenAt(localSeenAt);
        }
      } else if (serverSeenAt && !localSeenAt) {
        syncSeenAt(serverSeenAt);
      } else if (!serverSeenAt && localSeenAt) {
        updateUserProfile({ keyword_notice_seen_at: localSeenAt })
          .then((updatedUser) => {
            useUserStore.getState().setUser(updatedUser);
            getQueryClient()?.setQueryData(['user', 'profile'], updatedUser);
          })
          .catch(() => {});
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
  }, [isLoggedIn, loadKeywordCount, loadKeywordNoticesSilent, syncSeenAt]);

  useEffect(() => {
    if (!isLoggedIn) {
      setHasNewKeywordNotices(false);
      setNewKeywordCount(0);
      return;
    }
    updateKeywordBadge(keywordNotices);
  }, [keywordNotices, isLoggedIn, updateKeywordBadge]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isLoggedIn) {
        refreshKeywordNotices();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isLoggedIn, refreshKeywordNotices]);

  useEffect(() => {
    const syncOnUnload = () => {
      if (!_syncPending.current) return;
      const localVal = seenAtRef.current;
      if (!localVal) return;
      const token = getAccessToken();
      if (!token) return;

      fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ keyword_notice_seen_at: localVal }),
        keepalive: true,
      }).catch(() => {});
      _syncPending.current = false;
    };

    const handleHidden = () => {
      if (document.visibilityState === 'hidden') syncOnUnload();
    };

    document.addEventListener('visibilitychange', handleHidden);
    window.addEventListener('pagehide', syncOnUnload);
    return () => {
      document.removeEventListener('visibilitychange', handleHidden);
      window.removeEventListener('pagehide', syncOnUnload);
    };
  }, []);

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
