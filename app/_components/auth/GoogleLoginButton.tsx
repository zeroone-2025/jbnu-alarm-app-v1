'use client';

import { useEffect } from 'react';

import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { useRouter } from 'next/navigation';
import { FiLogIn } from 'react-icons/fi';

import { getGoogleLoginUrl, fetchGoogleLoginUrl } from '@/_lib/api';
import { setAccessToken } from '@/_lib/auth/tokenStore';

interface GoogleLoginButtonProps {
  onLoginStart?: () => void;
  fullWidth?: boolean;
}

export default function GoogleLoginButton({
  onLoginStart,
  fullWidth = false
}: GoogleLoginButtonProps) {
  const router = useRouter();

  const getRedirectTo = () => {
    if (typeof window === 'undefined') return undefined;
    const redirectTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    return redirectTo.startsWith('/') ? redirectTo : undefined;
  };

  // Deep Link 이벤트 리스너 (iOS/Android)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listenerHandle: { remove: () => void } | null = null;
    let isProcessing = false; // 중복 처리 방지 플래그

    const handleDeepLink = async (urlString: string) => {
      // 이미 처리된 URL인지 확인 (로그아웃 후 재실행 방지)
      const lastProcessedUrl = localStorage.getItem('last_processed_url');
      if (lastProcessedUrl === urlString) {
        return;
      }

      if (urlString.startsWith('kr.zerotime.app://auth/callback')) {
        if (isProcessing) return;

        const url = new URL(urlString.replace('kr.zerotime.app://', 'https://dummy.com/'));
        const accessToken = url.searchParams.get('access_token');

        if (accessToken) {
          isProcessing = true;
          setAccessToken(accessToken);

          // 처리된 URL 저장 (재실행 방지)
          localStorage.setItem('last_processed_url', urlString);

          try {
            await Browser.close();
          } catch {
            // 브라우저가 이미 닫혀있을 수 있음
          }

          const redirectTo = url.searchParams.get('redirect_to');
          const safeRedirect = redirectTo?.startsWith('/') ? redirectTo : '/';
          setTimeout(() => {
            router.replace(safeRedirect);
          }, 300);
        }
      }
    };

    const setupListener = async () => {
      // 1. 리스너 등록 (백그라운드 -> 포그라운드 전환 시)
      listenerHandle = await App.addListener('appUrlOpen', async (event) => {
        await handleDeepLink(event.url);
      });

      // 2. 초기 URL 확인 (앱이 꺼진 상태에서 켜질 시)
      const launchUrl = await App.getLaunchUrl();
      if (launchUrl && launchUrl.url) {
        handleDeepLink(launchUrl.url);
      }
    };

    setupListener();

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [router]);

  const handleLogin = async () => {
    onLoginStart?.();
    localStorage.setItem('last_login_provider', 'google');

    // 플랫폼 감지 (web, android, ios)
    const platform = Capacitor.getPlatform();
    const redirectTo = getRedirectTo();
    const buildLoginUrl = () => {
      const baseUrl = getGoogleLoginUrl(redirectTo);
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}platform=${encodeURIComponent(platform)}`;
    };

    if (Capacitor.isNativePlatform()) {
      if (platform === 'ios') {
        try {
          // iOS: In-App Browser (SFSafariViewController) 사용
          // Deep Link로 앱으로 돌아올 수 있도록 in-app browser 사용
          const googleUrl = await fetchGoogleLoginUrl(platform, redirectTo);
          await Browser.open({
            url: googleUrl,
            presentationStyle: 'fullscreen'  // In-app browser로 열기
          });
        } catch (error) {
          console.error('Failed to get login URL:', error);
          // 실패 시 기존 방식 시도
          const loginUrl = buildLoginUrl();
          await Browser.open({
            url: loginUrl,
            presentationStyle: 'fullscreen'
          });
        }
      } else {
        // Android: In-App Browser (Chrome Custom Tabs) 사용
        const loginUrl = buildLoginUrl();
        await Browser.open({
          url: loginUrl,
          presentationStyle: 'popover'
        });
      }
    } else {
      // Web: 기존 방식 유지
      const loginUrl = buildLoginUrl();
      window.location.href = loginUrl;
    }
  };

  return (
    <button
      onClick={handleLogin}
      className={`flex items-center gap-3 px-4 py-3 text-blue-600 transition-colors rounded-xl bg-blue-50 hover:bg-blue-100 ${fullWidth ? 'w-full' : ''
        }`}
    >
      <div className="flex items-center justify-center w-8 h-8 text-blue-600 bg-white rounded-full">
        <FiLogIn size={16} />
      </div>
      <span className="font-medium">Google 계정으로 로그인</span>
    </button>
  );
}
