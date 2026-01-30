import { API_BASE_URL, authApi } from './client';
import { setAccessToken, clearAccessToken, hasAccessToken } from '@/_lib/auth/tokenStore';

// 인증 초기화 상태
let isAuthInitialized = false;
let initializationPromise: Promise<boolean> | null = null;

// 구글 로그인 URL 생성 (리다이렉트용)
export const getGoogleLoginUrl = () => {
    return `${API_BASE_URL}/auth/google/login`;
};

// 인증 초기화 여부 확인
export const isAuthReady = () => isAuthInitialized;

// 토큰 존재 여부 확인
export const checkHasToken = () => hasAccessToken();

// Refresh Token으로 새 Access Token 발급
export const refreshAccessToken = async (): Promise<string | null> => {
    try {
        const response = await authApi.post<{ access_token: string }>('/auth/refresh');
        const newToken = response.data.access_token;

        if (newToken) {
            setAccessToken(newToken);
            return newToken;
        }
        return null;
    } catch (error) {
        clearAccessToken();
        return null;
    }
};

// 앱 시작 시 세션 복구 (refresh token으로 access token 재발급)
export const initializeAuth = async (): Promise<boolean> => {
    // 이미 초기화 중이면 기존 Promise 반환
    if (initializationPromise) {
        return initializationPromise;
    }

    // 이미 초기화 완료면 토큰 존재 여부 반환
    if (isAuthInitialized) {
        return hasAccessToken();
    }

    initializationPromise = (async () => {
        try {
            const token = await refreshAccessToken();
            isAuthInitialized = true;
            return !!token;
        } catch {
            isAuthInitialized = true;
            return false;
        } finally {
            initializationPromise = null;
        }
    })();

    return initializationPromise;
};

// 로그아웃 (백엔드에 요청 + 메모리 토큰 삭제)
export const logoutUser = async (): Promise<void> => {
    try {
        await authApi.post('/auth/logout');
    } catch {
        // 로그아웃 요청 실패해도 로컬 상태는 정리
    } finally {
        clearAccessToken();
        isAuthInitialized = false;
    }
};

// 인증 상태 초기화 (테스트용)
export const resetAuthState = (): void => {
    isAuthInitialized = false;
    initializationPromise = null;
    clearAccessToken();
};
