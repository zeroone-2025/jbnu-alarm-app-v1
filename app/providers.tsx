'use client';

import { useEffect } from 'react';
import { setAccessToken, getAccessToken } from '@/api';
import axios from 'axios';

/**
 * Providers wrapper component
 * Handles token restoration on page load and provides context for the app
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 페이지 로드 시 토큰 복구 시도
    const restoreSession = async () => {
      // 이미 Access Token이 메모리에 있으면 스킵
      if (getAccessToken()) {
        return;
      }

      try {
        // Refresh Token 쿠키를 사용하여 새 Access Token 발급
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
        const { data } = await axios.post<{ access_token: string; token_type: string }>(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true, // Refresh Token 쿠키 전송
          }
        );

        // 새 Access Token을 메모리에 저장
        setAccessToken(data.access_token);
        console.log('Session restored successfully');
      } catch (error) {
        // Refresh Token이 없거나 만료된 경우 (로그인 안된 상태)
        // 에러를 무시하고 로그인 안된 상태로 유지
        console.log('No valid session found');
      }
    };

    restoreSession();
  }, []);

  return <>{children}</>;
}
