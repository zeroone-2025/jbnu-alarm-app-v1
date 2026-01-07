'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGoogleLoginUrl } from '@/api';
import { FiX, FiLogIn, FiLogOut, FiUser } from 'react-icons/fi';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 상태 체크
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLogin = () => {
    const redirectUri = `${window.location.origin}/auth/callback`;
    window.location.href = getGoogleLoginUrl(redirectUri);
  };

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('accessToken');
      setIsLoggedIn(false);
      onClose();
      router.push('/');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
            <h2 className="text-lg font-bold text-gray-800">메뉴</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="mb-8">
              <h3 className="mb-3 text-xs font-semibold uppercase text-gray-400">계정</h3>
              
              {!isLoggedIn ? (
                <>
                  <button
                    onClick={handleLogin}
                    className="flex w-full items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-blue-600 transition-colors hover:bg-blue-100"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-600">
                      <FiLogIn size={16} />
                    </div>
                    <span className="font-medium">Google 계정으로 로그인</span>
                  </button>
                  <p className="mt-2 text-xs text-gray-500 px-1">
                    로그인하여 설정을 동기화하고 더 많은 기능을 이용해보세요.
                  </p>
                </>
              ) : (
                <div className="rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <FiUser size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">사용자 님</p>
                      <p className="text-xs text-gray-500">로그인되었습니다</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                  >
                    <FiLogOut size={16} />
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-5">
            <p className="text-xs text-center text-gray-400">ZeroTime v0.1.0</p>
          </div>
        </div>
      </div>
    </>
  );
}
