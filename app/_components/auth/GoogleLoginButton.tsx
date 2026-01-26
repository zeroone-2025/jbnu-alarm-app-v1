'use client';

import { FiLogIn } from 'react-icons/fi';
import { getGoogleLoginUrl } from '@/_lib/api';

import { openLinkInExternalBrowser } from '@/_lib/utils/external-browser';

interface GoogleLoginButtonProps {
  onLoginStart?: () => void;
  fullWidth?: boolean;
}

export default function GoogleLoginButton({
  onLoginStart,
  fullWidth = false
}: GoogleLoginButtonProps) {
  const handleLogin = () => {
    onLoginStart?.();
    const loginUrl = getGoogleLoginUrl();
    openLinkInExternalBrowser(loginUrl);
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
