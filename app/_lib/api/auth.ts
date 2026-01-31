import { API_BASE_URL, authApi } from './client';
import { setAccessToken, clearAccessToken, hasAccessToken } from '@/_lib/auth/tokenStore';

// 인증 초기화 상태
let isAuthInitialized = false;
let initializationPromise: Promise<boolean> | null = null;

// 구글 로그인 URL 생성 (리다이렉트용)
export const getGoogleLoginUrl = () => {
    return `${API_BASE_URL}/auth/google/login`;
};

// 구글 로그인 URL 가져오기 (비동기) - iOS 외부 브라우저용
export const fetchGoogleLoginUrl = async (platform: string): Promise<string> => {
    const response = await authApi.get<{ url: string }>(`/auth/google/login/url?platform=${platform}`);
    return response.data.url;
};

// 인증 초기화 여부 확인
export const isAuthReady = () => isAuthInitialized;

// 토큰 존재 여부 확인
export const checkHasToken = () => hasAccessToken();

// Refresh Token 쿠키 존재 여부 확인 (경량 체크)
export const checkRefreshToken = async (): Promise<boolean> => {
    try {
        const response = await authApi.get<{ hasToken: boolean }>('/auth/check');
        return response.data.hasToken;
    } catch (error) {
        return false;
    }
};

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
            // 1. 먼저 refresh token 쿠키가 있는지 확인 (경량 체크)
            const hasRefreshToken = await checkRefreshToken();

            // 2. 쿠키가 없으면 refresh 요청하지 않음 (401 에러 방지)
            if (!hasRefreshToken) {
                isAuthInitialized = true;
                return false;
            }

            // 3. 쿠키가 있으면 refresh 요청
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
