'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { getSocialLoginUrl, fetchSocialLoginUrl, OAuthProvider } from '@/_lib/api';
import { setAccessToken } from '@/_lib/auth/tokenStore';
import { useRouter } from 'next/navigation';

interface ProviderConfig {
  label: string;
  bg: string;
  text: string;
  icon: string;
}

const PROVIDER_CONFIGS: Record<OAuthProvider, ProviderConfig> = {
  google: {
    label: 'Google',
    bg: 'bg-white border border-gray-200',
    text: 'text-gray-700',
    icon: '/icons/google.svg',
  },
  apple: {
    label: 'Apple',
    bg: 'bg-black',
    text: 'text-white',
    icon: '/icons/apple.svg',
  },
  naver: {
    label: '네이버',
    bg: 'bg-[#03C75A]',
    text: 'text-white',
    icon: '/icons/naver.svg',
  },
  kakao: {
    label: '카카오',
    bg: 'bg-[#FEE500]',
    text: 'text-[#191919]',
    icon: '/icons/kakao.svg',
  },
};

interface SocialLoginButtonProps {
  provider: OAuthProvider;
  onLoginStart?: () => void;
  redirectTo?: string;
}

export default function SocialLoginButton({
  provider,
  onLoginStart,
  redirectTo,
}: SocialLoginButtonProps) {
  const router = useRouter();
  const config = PROVIDER_CONFIGS[provider];

  const getRedirectTo = () => {
    if (redirectTo?.startsWith('/')) return redirectTo;
    if (typeof window === 'undefined') return undefined;
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    return currentPath.startsWith('/') ? currentPath : undefined;
  };

  // Deep Link 이벤트 리스너 (iOS/Android) - 모든 프로바이더 공통
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listenerHandle: any;
    let isProcessing = false;

    const handleDeepLink = async (urlString: string) => {
      const lastProcessedUrl = localStorage.getItem('last_processed_url');
      if (lastProcessedUrl === urlString) return;

      if (urlString.startsWith('kr.zerotime.app://auth/callback')) {
        if (isProcessing) return;

        const url = new URL(urlString.replace('kr.zerotime.app://', 'https://dummy.com/'));
        const accessToken = url.searchParams.get('access_token');

        if (accessToken) {
          isProcessing = true;
          setAccessToken(accessToken);
          localStorage.setItem('last_processed_url', urlString);

          try {
            await Browser.close();
          } catch (e) {
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
      listenerHandle = await App.addListener('appUrlOpen', async (event) => {
        await handleDeepLink(event.url);
      });

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
    localStorage.setItem('last_login_provider', provider);

    const platform = Capacitor.getPlatform();

    const redirectTo = getRedirectTo();
    const buildLoginUrl = () => {
      const baseUrl = getSocialLoginUrl(provider, redirectTo);
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}platform=${encodeURIComponent(platform)}`;
    };

    if (Capacitor.isNativePlatform()) {
      if (platform === 'ios') {
        try {
          const loginUrl = await fetchSocialLoginUrl(provider, platform, redirectTo);
          await Browser.open({
            url: loginUrl,
            presentationStyle: 'fullscreen',
          });
        } catch (error) {
          console.error('Failed to get login URL:', error);
          const loginUrl = buildLoginUrl();
          await Browser.open({
            url: loginUrl,
            presentationStyle: 'fullscreen',
          });
        }
      } else {
        const loginUrl = buildLoginUrl();
        await Browser.open({
          url: loginUrl,
          presentationStyle: 'popover',
        });
      }
    } else {
      const loginUrl = buildLoginUrl();
      window.location.href = loginUrl;
    }
  };

  return (
    <button
      onClick={handleLogin}
      className={`flex w-full items-center justify-center gap-2 px-3 py-3 rounded-xl transition-colors ${config.bg} hover:opacity-90`}
    >
      <Image src={config.icon} alt={provider} width={18} height={18} />
      <span className={`text-sm font-medium ${config.text}`}>{config.label}</span>
    </button>
  );
}
