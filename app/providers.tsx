'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/_lib/hooks/useUser';
import { initializeAuth, isAuthReady, refreshAccessToken } from '@/_lib/api';
import { hasAccessToken, restoreAccessToken } from '@/_lib/auth/tokenStore';
import persistentStorage from '@/_lib/utils/persistentStorage';

// QueryClient 인스턴스를 외부에서 접근할 수 있도록 export
let globalQueryClient: QueryClient | null = null;

export function getQueryClient() {
  return globalQueryClient;
}

// 인증 초기화 상태 Context
const AuthInitContext = createContext<boolean>(false);

export function useAuthInitialized() {
  return useContext(AuthInitContext);
}

// persistentStorage가 관리할 키 목록
const PERSISTENT_STORAGE_KEYS = [
  'my_subscribed_categories',
  'JB_ALARM_GUEST_FILTER_VERSION',
  'current_filter',
  'keyword_notice_seen_at',
  'last_processed_url',
  'last_login_provider',
  'session_hint',
];

/**
 * 앱 시작 시 세션 복구를 담당하는 컴포넌트
 * - persistent storage 초기화 → localStorage 마이그레이션 → 세션 복구
 */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 이미 초기화되었으면 스킵
    if (isAuthReady()) {
      setIsInitialized(true);
      return;
    }

    // 디버깅용 로그
    console.log('[Auth] Initializing... environment:', {
      href: window.location.href,
      origin: window.location.origin
    });

    const hideSplash = async () => {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide().catch(() => { });
        console.log('[Capacitor] Splash screen hidden');
      }
    };

    // 1. persistent storage 초기화 → 마이그레이션 → 세션 복구
    const authPromise = (async () => {
      await persistentStorage.init(PERSISTENT_STORAGE_KEYS);
      await persistentStorage.migrateFromLocalStorage(PERSISTENT_STORAGE_KEYS);
      await initializeAuth();
      console.log('[Auth] Session recovery complete');
    })().catch(err => {
      console.error('[Auth] Session recovery failed:', err);
    });

    // 2. 안전장치: 5초 후에는 무조건 Splash 닫기 (네이티브 앱 전용)
    const timeoutPromise = new Promise(resolve => setTimeout(() => {
      console.log('[Auth] Initialization timeout (5s)');
      resolve(null);
    }, 5000));

    // 어느 쪽이 먼저든 끝나면 UI 표시 및 스플래시 숨기기
    Promise.race([authPromise, timeoutPromise]).finally(() => {
      setIsInitialized(true);
      hideSplash();
    });
  }, []);

  // Deep Link 리스너 (OAuth 콜백 처리)
  useEffect(() => {
    let listener: { remove: () => void } | null = null;

    const setupDeepLinkListener = async () => {
      const { Capacitor } = await import('@capacitor/core');

      if (!Capacitor.isNativePlatform()) return;

      const { App } = await import('@capacitor/app');
      const { Browser } = await import('@capacitor/browser');
      const { setAccessToken } = await import('@/_lib/auth/tokenStore');

      listener = await App.addListener('appUrlOpen', async (event) => {
        console.log('[Deep Link] Received:', event.url);

        try {
          const url = new URL(event.url);

          // OAuth 콜백 처리
          if (url.pathname.includes('auth/callback')) {
            const accessToken = url.searchParams.get('access_token');

            if (accessToken) {
              console.log('[Deep Link] Access token received, storing...');
              await setAccessToken(accessToken);

              // 외부 브라우저 닫기
              await Browser.close();

              const redirectTo = url.searchParams.get('redirect_to');
              const safeRedirect = redirectTo?.startsWith('/') ? redirectTo : '/';
              // redirect_to가 있으면 해당 경로로 이동
              window.location.href = safeRedirect;
            }
          }
        } catch (error) {
          console.error('[Deep Link] Error processing URL:', error);
        }
      });
    };

    setupDeepLinkListener();

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, []);

  // 앱 포그라운드 복귀 시 토큰 복원 (iOS WKWebView 메모리 정리 대응)
  useEffect(() => {
    let appStateListener: { remove: () => void } | null = null;

    const setupAppStateListener = async () => {
      const { Capacitor } = await import('@capacitor/core');
      if (!Capacitor.isNativePlatform()) return;

      const { App } = await import('@capacitor/app');

      appStateListener = await App.addListener('appStateChange', async ({ isActive }) => {
        if (!isActive) return;

        // 포그라운드 복귀 시 토큰이 없으면 복원 시도
        if (!hasAccessToken()) {
          console.log('[AppState] Foregrounded without token, attempting restore...');
          const restored = await restoreAccessToken();
          if (!restored) {
            console.log('[AppState] Keychain restore failed, attempting refresh...');
            await refreshAccessToken();
          }
        }
      });
    };

    setupAppStateListener();

    return () => {
      if (appStateListener) {
        appStateListener.remove();
      }
    };
  }, []);

  return (
    <AuthInitContext.Provider value={isInitialized}>
      {children}
    </AuthInitContext.Provider>
  );
}

/**
 * 전역 유저 데이터를 초기화하고 동기화하는 컴포넌트
 * 로그인 상태에서 push 리스너 설정 및 토큰 갱신도 담당
 */
function UserHydrator() {
  const { isLoggedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) return;

    const setupPush = async () => {
      const { Capacitor } = await import('@capacitor/core');
      if (!Capacitor.isNativePlatform()) return;
      const { setupPushListeners, registerPushNotifications } = await import('@/_lib/push/pushNotifications');
      setupPushListeners((path) => router.push(path));
      registerPushNotifications().catch(() => {});
    };

    setupPush();
  }, [isLoggedIn, router]);

  return null;
}

/**
 * Providers wrapper component
 * Includes React Query for data fetching and caching
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  // QueryClient는 컴포넌트 내부에서 생성 (SSR 이슈 방지)
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60, // 1분 동안 데이터를 fresh로 간주
          gcTime: 1000 * 60 * 5, // 5분 동안 캐시 유지
          refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 재요청 비활성화
          retry: 1, // 실패 시 1번만 재시도
        },
      },
    });
    globalQueryClient = client;
    return client;
  });

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister().catch(() => { });
      });
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <UserHydrator />
        {children}
      </AuthInitializer>
    </QueryClientProvider>
  );
}
