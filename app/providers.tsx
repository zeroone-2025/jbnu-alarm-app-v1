'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useUser } from '@/_lib/hooks/useUser';

// QueryClient 인스턴스를 외부에서 접근할 수 있도록 export
let globalQueryClient: QueryClient | null = null;

export function getQueryClient() {
  return globalQueryClient;
}

/**
 * 전역 유저 데이터를 초기화하고 동기화하는 컴포넌트
 */
function UserHydrator() {
  useUser();
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
      <UserHydrator />
      {children}
    </QueryClientProvider>
  );
}
