'use client';

import SocialLoginButton from './SocialLoginButton';
import { OAuthProvider } from '@/_lib/api';

interface LoginButtonGroupProps {
  onLoginStart?: () => void;
  layout?: 'grid' | 'stack';
  redirectTo?: string;
}

// 왼쪽 위부터: Google → Apple → Naver → Kakao
const PROVIDER_ORDER: OAuthProvider[] = ['google', 'apple', 'naver', 'kakao'];

export default function LoginButtonGroup({ onLoginStart, layout = 'grid', redirectTo }: LoginButtonGroupProps) {
  return (
    <div className={layout === 'stack' ? 'flex flex-col gap-2' : 'grid grid-cols-2 gap-2'}>
      {PROVIDER_ORDER.map((provider) => (
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
