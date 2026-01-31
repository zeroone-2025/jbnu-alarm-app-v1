'use client';

import { useEffect } from 'react';
import { FiLogIn } from 'react-icons/fi';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { getGoogleLoginUrl, fetchGoogleLoginUrl } from '@/_lib/api';
import { setAccessToken } from '@/_lib/auth/tokenStore';
import { useInAppBrowser } from '@/_context/InAppBrowserContext';
import { isInAppBrowser } from '@/_lib/utils/external-browser';
import { useRouter } from 'next/navigation';

interface GoogleLoginButtonProps {
  onLoginStart?: () => void;
  fullWidth?: boolean;
}

export default function GoogleLoginButton({
  onLoginStart,
  fullWidth = false
}: GoogleLoginButtonProps) {
  const { openModal } = useInAppBrowser();
  const router = useRouter();

  // Deep Link 이벤트 리스너 (iOS/Android)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listenerHandle: any;
    let isProcessing = false; // 중복 처리 방지 플래그

    const handleDeepLink = async (urlString: string) => {
      if (urlString.startsWith('kr.zerotime.app://auth/callback')) {
        if (isProcessing) return;

        const url = new URL(urlString.replace('kr.zerotime.app://', 'https://dummy.com/'));
        const accessToken = url.searchParams.get('access_token');

        if (accessToken) {
          isProcessing = true;
          setAccessToken(accessToken);

          try {
            await Browser.close();
          } catch (e) {
            // 브라우저가 이미 닫혀있을 수 있음
          }

          setTimeout(() => {
            router.replace('/');
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
    if (isInAppBrowser()) {
      openModal();
      return;
    }

    onLoginStart?.();

    // 플랫폼 감지 (web, android, ios)
    const platform = Capacitor.getPlatform();

    if (Capacitor.isNativePlatform()) {
      if (platform === 'ios') {
        try {
          // iOS: 백엔드에서 직접 구글 로그인 URL을 받아와서 오픈
          // Browser.open의 windowName: '_system'으로 외부 Safari 앱 실행
          const googleUrl = await fetchGoogleLoginUrl(platform);
          await Browser.open({
            url: googleUrl,
            windowName: '_system'  // 외부 브라우저로 열기
          });
        } catch (error) {
          console.error('Failed to get login URL:', error);
          // 실패 시 기존 방식 시도
          const loginUrl = `${getGoogleLoginUrl()}?platform=${platform}`;
          await Browser.open({
            url: loginUrl,
            windowName: '_system'
          });
        }
      } else {
        // Android: In-App Browser (Chrome Custom Tabs) 사용
        const loginUrl = `${getGoogleLoginUrl()}?platform=${platform}`;
        await Browser.open({
          url: loginUrl,
          presentationStyle: 'popover'
        });
      }
    } else {
      // Web: 기존 방식 유지
      const loginUrl = `${getGoogleLoginUrl()}?platform=${platform}`;
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
