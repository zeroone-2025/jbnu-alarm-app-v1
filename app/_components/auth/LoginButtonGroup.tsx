'use client';

import { useEffect, useState } from 'react';

import { OAuthProvider } from '@/_lib/api';
import { isInAppBrowser } from '@/_lib/utils/external-browser';

import SocialLoginButton from './SocialLoginButton';

interface LoginButtonGroupProps {
  onLoginStart?: () => void;
  layout?: 'grid' | 'stack';
  redirectTo?: string;
}

// 왼쪽 위부터: Google → Apple → Naver → Kakao
const PROVIDER_ORDER: OAuthProvider[] = ['google', 'apple', 'naver', 'kakao'];

export default function LoginButtonGroup({ onLoginStart, layout = 'grid', redirectTo }: LoginButtonGroupProps) {
  const [visibleProviders, setVisibleProviders] = useState<OAuthProvider[] | null>(null);

  useEffect(() => {
    const providers = isInAppBrowser()
      ? PROVIDER_ORDER.filter((provider) => provider !== 'google')
      : PROVIDER_ORDER;
    setVisibleProviders(providers);
  }, []);

  if (!visibleProviders) {
    return null;
  }

  return (
    <div className={layout === 'stack' ? 'flex flex-col gap-2' : 'grid grid-cols-2 gap-2'}>
      {visibleProviders.map((provider) => (
        <SocialLoginButton
          key={provider}
          provider={provider}
          onLoginStart={onLoginStart}
          redirectTo={redirectTo}
        />
      ))}
    </div>
  );
}
