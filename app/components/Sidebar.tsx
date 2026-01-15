'use client';

import { useEffect, useState } from 'react';
import { getGoogleLoginUrl, getUserProfile, UserProfile } from '@/api';
import { FiX, FiLogIn, FiLogOut, FiUser } from 'react-icons/fi';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // 로그인 상태 체크 및 프로필 로드
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('accessToken');
      setIsLoggedIn(!!token);

      // 로그인되어 있으면 프로필 로드
      if (token) {
        getUserProfile()
          .then((profile) => setUser(profile))
          .catch(() => {
            // 토큰이 만료되었거나 에러 발생 시
            setIsLoggedIn(false);
            setUser(null);
          });
      } else {
        setUser(null);
      }
    }
  }, [isOpen]);

  const handleLogin = () => {
    onClose();
    // 바로 백엔드 Google OAuth URL로 리다이렉트
    window.location.href = getGoogleLoginUrl();
  };

  const handleLogout = () => {
    // localStorage 정리
    localStorage.removeItem('accessToken');
    localStorage.removeItem('my_subscribed_categories');

    setIsLoggedIn(false);
    onClose();

    // 홈으로 이동하면서 토스트 표시
    window.location.href = '/?logout=success';
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 z-40 bg-black/50 transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`absolute inset-y-0 left-0 z-50 w-72 transform bg-white shadow-xl transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">메뉴</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 transition-colors rounded-full hover:bg-gray-100 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-5 overflow-y-auto">
            <div className="mb-8">
              <h3 className="mb-3 text-xs font-semibold text-gray-400 uppercase">계정</h3>
              
              {!isLoggedIn ? (
                <>
                  <button
                    onClick={handleLogin}
                    className="flex items-center w-full gap-3 px-4 py-3 text-blue-600 transition-colors rounded-xl bg-blue-50 hover:bg-blue-100"
                  >
                    <div className="flex items-center justify-center w-8 h-8 text-blue-600 bg-white rounded-full">
                      <FiLogIn size={16} />
                    </div>
                    <span className="font-medium">Google 계정으로 로그인</span>
                  </button>
                  <p className="px-1 mt-2 text-xs text-gray-500">
                    로그인하여 설정을 저장하고 더 많은 기능을 이용해보세요.
                  </p>
                </>
              ) : (
                <div className="p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    {user?.profile_image ? (
                      <img
                        src={user.profile_image}
                        alt={user.nickname || '사용자'}
                        className="object-cover w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-10 h-10 text-blue-600 bg-blue-100 rounded-full">
                        <FiUser size={20} />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {user?.nickname || '사용자'} 님
                      </p>
                      {/* <p className="text-xs text-gray-500">로그인되었습니다</p> */}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-full gap-2 py-2 text-sm font-medium text-red-500 transition-colors border border-red-100 rounded-lg hover:bg-red-50"
                  >
                    <FiLogOut size={16} />
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-gray-100">
            <p className="text-xs text-center text-gray-400">ZeroTime v0.1.0</p>
          </div>
        </div>
      </div>
    </>
  );
}
