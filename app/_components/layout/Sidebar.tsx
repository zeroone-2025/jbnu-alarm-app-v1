'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiX, FiUser, FiChevronRight } from 'react-icons/fi';
import { useUserStore } from '@/_lib/store/useUserStore';
import { useUser } from '@/_lib/hooks/useUser';
import GoogleLoginButton from '@/_components/auth/GoogleLoginButton';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  // useUserStore에서 user를 가져오는 대신, useUser 훅에서 모든 관련 상태를 가져옵니다.
  const { user, isLoggedIn, isAuthLoaded, isLoading } = useUser();

  const handleProfileClick = () => {
    onClose();
    router.push('/profile');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 z-40 bg-black/50 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`absolute inset-y-0 left-0 z-50 w-72 transform bg-white shadow-xl transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between shrink-0 h-[calc(4rem+var(--safe-area-top))] pt-safe px-5 border-b border-gray-100">
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

              {!isAuthLoaded || (isLoading && !user) ? (
                // 인증 확인 중이거나 로그인 상태지만 유저 데이터 로딩 중인 경우
                <div className="w-full p-4 border border-gray-100 bg-gray-50/50 rounded-xl animate-pulse h-[72px]" />
              ) : !isLoggedIn ? (
                <>
                  <GoogleLoginButton onLoginStart={onClose} fullWidth />
                  <p className="px-1 mt-2 text-xs text-gray-500">
                    로그인하여 설정을 저장하고 더 많은 기능을 이용해보세요.
                  </p>
                </>
              ) : (
                <button
                  onClick={handleProfileClick}
                  className="w-full p-4 text-left transition-all border border-gray-100 bg-gray-50/50 rounded-xl hover:bg-gray-100 active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
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
                        <p className="text-[11px] text-gray-400">프로필 관리하기</p>
                      </div>
                    </div>
                    <FiChevronRight className="text-gray-400" size={18} />
                  </div>
                </button>
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
