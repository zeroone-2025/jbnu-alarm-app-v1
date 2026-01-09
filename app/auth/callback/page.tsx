'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processedRef = useRef(false);
  const [status, setStatus] = useState('로그인 처리 중...');

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const accessToken = searchParams.get('access_token');

    if (accessToken) {
      try {
        // 백엔드에서 전달받은 JWT를 localStorage에 저장
        localStorage.setItem('accessToken', accessToken);
        setStatus('로그인 성공! 홈으로 이동합니다.');

        // 성공 시 홈으로 이동
        setTimeout(() => {
          router.replace('/?login=success');
        }, 500);
      } catch (error) {
        console.error('Login failed:', error);
        setStatus('로그인 실패. 다시 시도해주세요.');

        // 실패 시 로그인 페이지로 이동
        setTimeout(() => {
          router.replace('/login');
        }, 2000);
      }
    } else {
      console.error('No access_token parameter found in URL');
      setStatus('잘못된 접근입니다. 로그인 페이지로 이동합니다.');

      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="text-lg font-medium text-gray-700">{status}</p>
      </div>
    </div>
  );
}
