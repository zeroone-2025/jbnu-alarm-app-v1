'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { processGoogleCallback } from '@/api';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const processedRef = useRef(false); // React 18 Strict Mode 방지

  useEffect(() => {
    // 이미 처리했으면 중단
    if (processedRef.current) return;

    const code = searchParams.get('code');
    const token = searchParams.get('access_token'); // 백엔드에서 직접 토큰을 줄 경우 대비

    const handleLogin = async () => {
      processedRef.current = true; // 처리 시작 표시

      try {
        let accessToken = token;

        if (!accessToken && code) {
          // 코드가 있으면 백엔드 교환 요청
          const response = await processGoogleCallback(code);
          accessToken = response.access_token;
        }

        if (accessToken) {
          // 토큰 저장
          localStorage.setItem('accessToken', accessToken);
          setStatus('success');
          // 홈으로 이동
          router.replace('/');
        } else {
          throw new Error('인증 정보가 없습니다.');
        }
      } catch (error: any) {
        console.error('Login failed:', error);
        setStatus('error');
        setErrorMessage(error.message || '로그인 처리에 실패했습니다.');
        // 에러 발생 시 3초 후 홈으로 이동
        setTimeout(() => router.replace('/'), 3000);
      }
    };

    if (code || token) {
      handleLogin();
    } else {
      // 파라미터가 없으면 그냥 홈으로
      router.replace('/');
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
        {status === 'loading' && (
          <>
            <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <h2 className="text-lg font-bold text-gray-800">로그인 처리 중...</h2>
            <p className="mt-2 text-sm text-gray-500">잠시만 기다려주세요.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto mb-6 text-4xl">✅</div>
            <h2 className="text-lg font-bold text-gray-800">로그인 성공!</h2>
            <p className="mt-2 text-sm text-gray-500">홈으로 이동합니다...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto mb-6 text-4xl">⚠️</div>
            <h2 className="text-lg font-bold text-red-600">로그인 실패</h2>
            <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>
            <p className="mt-4 text-xs text-gray-400">잠시 후 홈으로 이동합니다.</p>
          </>
        )}
      </div>
    </div>
  );
}
