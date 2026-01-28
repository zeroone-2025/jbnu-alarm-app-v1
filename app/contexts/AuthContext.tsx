'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setAccessToken, getAccessToken, clearAccessToken } from '@/api';
import axios from 'axios';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  authStatus: AuthStatus;
  login: (accessToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    const initAuth = async () => {
      // 이미 메모리에 Access Token이 있으면 인증됨
      if (getAccessToken()) {
        setAuthStatus('authenticated');
        return;
      }

      // 앱 최초 로딩 시 무조건 refresh 한 번 호출
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
        const { data } = await axios.post<{ access_token: string; token_type: string }>(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true, // Refresh Token 쿠키 전송
          }
        );

        // 성공: Access Token 저장 및 인증 상태로 전환
        setAccessToken(data.access_token);
        setAuthStatus('authenticated');
      } catch (error) {
        // 실패(401): 비인증 상태로 전환 (조용히 처리)
        setAuthStatus('unauthenticated');
      }
    };

    initAuth();
  }, []);

  const login = (accessToken: string) => {
    setAccessToken(accessToken);
    setAuthStatus('authenticated');
  };

  const logout = () => {
    clearAccessToken();
    setAuthStatus('unauthenticated');
  };

  return (
    <AuthContext.Provider value={{ authStatus, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
