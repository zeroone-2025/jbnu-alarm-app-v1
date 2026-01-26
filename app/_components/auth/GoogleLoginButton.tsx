'use client';

import { useState, useEffect } from 'react';
import { FiLogIn } from 'react-icons/fi';
import { useGoogleLogin } from '@react-oauth/google';
import { getGoogleLoginUrl, API_BASE_URL } from '@/_lib/api';

interface GoogleLoginButtonProps {
  onLoginStart?: () => void;
  fullWidth?: boolean;
}

// WebView 감지 함수
function isWebView(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent || navigator.vendor;

  // iOS WebView 감지
  const isIOSWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua);

  // Android WebView 감지
  const isAndroidWebView = /wv|WebView/i.test(ua);

  // 에브리타임 앱 감지
  const isEverytimeApp = /everytime/i.test(ua);

  return isIOSWebView || isAndroidWebView || isEverytimeApp;
}

export default function GoogleLoginButton({
  onLoginStart,
  fullWidth = false
}: GoogleLoginButtonProps) {
  const [useClientSideAuth, setUseClientSideAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 클라이언트에서만 WebView 감지
  useEffect(() => {
    setUseClientSideAuth(isWebView());
  }, []);

  // 클라이언트 사이드 OAuth (WebView용)
  const clientSideLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);

        // Google의 authorization code를 사용하여 ID token 가져오기
        const response = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code: tokenResponse.code,
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            redirect_uri: 'postmessage',
            grant_type: 'authorization_code',
          }),
        });

        const data = await response.json();

        // 백엔드에 ID token 전송
        const authResponse = await fetch(`${API_BASE_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: data.id_token }),
        });

        if (!authResponse.ok) {
          throw new Error('Authentication failed');
        }

        const authData = await authResponse.json();

        // JWT 저장 및 리다이렉트
        localStorage.setItem('accessToken', authData.access_token);
        window.location.href = '/auth/callback?access_token=' + authData.access_token;
      } catch (error) {
        console.error('Login failed:', error);
        alert('로그인에 실패했습니다. 다시 시도해주세요.');
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Login failed:', error);
      alert('로그인에 실패했습니다.');
      setIsLoading(false);
    },
    flow: 'auth-code',
  });

  // 서버 사이드 OAuth (일반 브라우저용)
  const handleServerSideLogin = () => {
    onLoginStart?.();
    window.location.href = getGoogleLoginUrl();
  };

  const handleLogin = () => {
    if (isLoading) return;

    onLoginStart?.();

    if (useClientSideAuth) {
      // WebView: 클라이언트 사이드 방식
      clientSideLogin();
    } else {
      // 일반 브라우저: 서버 사이드 방식
      handleServerSideLogin();
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className={`flex items-center gap-3 px-4 py-3 text-blue-600 transition-colors rounded-xl bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      <div className="flex items-center justify-center w-8 h-8 text-blue-600 bg-white rounded-full">
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <FiLogIn size={16} />
        )}
      </div>
      <span className="font-medium">
        {isLoading ? '로그인 중...' : 'Google 계정으로 로그인'}
      </span>
    </button>
  );
}
