import { useState, useEffect } from 'react';

/**
 * 로그인 상태를 관리하는 Hook
 * - localStorage의 accessToken 유무로 로그인 상태 판단
 * - visibility 변경 시 자동으로 재확인
 */
export function useAuthState() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  // 로그인 상태 확인 함수
  const checkAuthState = () => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('accessToken');
    const loggedIn = !!token;
    setIsLoggedIn(loggedIn);
    setIsAuthLoaded(true);
    return loggedIn;
  };

  // 초기 로그인 상태 확인
  useEffect(() => {
    checkAuthState();
  }, []);

  // 페이지 visibility 변경 시 로그인 상태 재확인
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuthState();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return { isLoggedIn, isAuthLoaded, checkAuthState };
}
