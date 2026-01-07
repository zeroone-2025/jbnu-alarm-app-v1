'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { processGoogleCallback } from '@/api';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;

    const code = searchParams.get('code');
    const token = searchParams.get('access_token');

    const handleLogin = async () => {
      processedRef.current = true;
      try {
        let accessToken = token;
        if (!accessToken && code) {
          const response = await processGoogleCallback(code);
          accessToken = response.access_token;
        }

        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          // 성공 시 홈으로 이동하며 쿼리 파라미터 전달
          router.replace('/?login=success');
        } else {
          throw new Error('No access token');
        }
      } catch (error) {
        console.error('Login failed:', error);
        // 실패 시에도 홈으로 이동
        router.replace('/?login=failed');
      }
    };

    if (code || token) {
      handleLogin();
    } else {
      router.replace('/');
    }
  }, [searchParams, router]);

  // 화면에 아무것도 표시하지 않음 (투명한 처리)
  return <div className="min-h-screen bg-white" />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
