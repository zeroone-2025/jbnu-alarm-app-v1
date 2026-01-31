'use client';

import { FiLogIn } from 'react-icons/fi';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { getGoogleLoginUrl } from '@/_lib/api';
import { useInAppBrowser } from '@/_context/InAppBrowserContext';
import { isInAppBrowser } from '@/_lib/utils/external-browser';

interface GoogleLoginButtonProps {
  onLoginStart?: () => void;
  fullWidth?: boolean;
}

export default function GoogleLoginButton({
  onLoginStart,
  fullWidth = false
}: GoogleLoginButtonProps) {
  const { openModal } = useInAppBrowser();

  const handleLogin = async () => {
    if (isInAppBrowser()) {
      openModal();
      return;
    }

    onLoginStart?.();

    // 플랫폼 감지 (web, android, ios)
    const platform = Capacitor.getPlatform();
    const loginUrl = `${getGoogleLoginUrl()}?platform=${platform}`;

    if (Capacitor.isNativePlatform()) {
      // Android/iOS: 외부 브라우저로 열기
      await Browser.open({
        url: loginUrl,
        presentationStyle: 'popover' // iOS: 모달, Android: 외부 브라우저
      });
    } else {
      // Web: 기존 방식 유지
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
