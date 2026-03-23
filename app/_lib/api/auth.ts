import { API_BASE_URL, authApi } from './client';
import {
    setAccessToken,
    clearAccessToken,
    hasAccessToken,
    restoreAccessToken,
    isRestoringToken,
} from '@/_lib/auth/tokenStore';
import persistentStorage from '@/_lib/utils/persistentStorage';
import { updateUserProfile } from './user';

// 인증 초기화 상태
let isAuthInitialized = false;
let initializationPromise: Promise<boolean> | null = null;

// OAuth 프로바이더 타입
export type OAuthProvider = 'google' | 'apple' | 'naver' | 'kakao';

// 범용 소셜 로그인 URL 생성 (리다이렉트용)
export const getSocialLoginUrl = (provider: OAuthProvider, redirectTo?: string) => {
    const redirectParam = redirectTo ? encodeURIComponent(redirectTo) : 'user';
    return `${API_BASE_URL}/auth/${provider}/login?redirect_to=${redirectParam}`;
};

// 범용 소셜 로그인 URL 가져오기 (비동기) - iOS 외부 브라우저용
export const fetchSocialLoginUrl = async (
    provider: OAuthProvider,
    platform: string,
    redirectTo?: string
): Promise<string> => {
    const redirectParam = redirectTo ? `&redirect_to=${encodeURIComponent(redirectTo)}` : '';
    const response = await authApi.get<{ url: string }>(`/auth/${provider}/login/url?platform=${platform}${redirectParam}`);
    return response.data.url;
};

// 하위 호환: 기존 함수 유지
export const getGoogleLoginUrl = (redirectTo?: string) => getSocialLoginUrl('google', redirectTo);
export const fetchGoogleLoginUrl = async (platform: string, redirectTo?: string) =>
    fetchSocialLoginUrl('google', platform, redirectTo);

// 인증 초기화 여부 확인
export const isAuthReady = () => isAuthInitialized;

// 토큰 존재 여부 확인
export const checkHasToken = () => hasAccessToken();

// Refresh Token으로 새 Access Token 발급
export const refreshAccessToken = async (): Promise<string | null> => {
    // single-flight: restoreAccessToken 진행 중이면 대기
    if (isRestoringToken()) return null;

    try {
        const response = await authApi.post<{ access_token: string }>('/auth/refresh');
        const newToken = response.data.access_token;

        if (newToken) {
            await setAccessToken(newToken);
            return newToken;
        }
        return null;
    } catch (error) {
        clearAccessToken();
        if (
            typeof window !== 'undefined' &&
            error instanceof Error &&
            'response' in (error as unknown as Record<string, unknown>)
        ) {
            const status = (error as { response?: { status?: number } }).response?.status;
            if (status === 401 || status === 403) {
                await persistentStorage.remove('session_hint');
            }
        }
        return null;
    }
};

// 앱 시작 시 세션 복구
// 복원 순서: ① Keychain 복원 → ② 실패 시 refresh(쿠키) → ③ 둘 다 실패 시 게스트
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
            // ① Keychain에서 토큰 복원 시도
            const restored = await restoreAccessToken();
            if (restored) {
                isAuthInitialized = true;
                return true;
            }

            // ② Native 환경 또는 session_hint가 있는 경우 refresh 시도
            const native = await (async () => {
                try {
                    const { Capacitor } = await import('@capacitor/core');
                    return Capacitor.isNativePlatform();
                } catch {
                    return false;
                }
            })();

            const hasSessionHint = native ||
                (typeof window !== 'undefined' && localStorage.getItem('session_hint') !== null);

            if (!hasSessionHint) {
                isAuthInitialized = true;
                return false;
            }

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
        await updateUserProfile({ fcm_token: null });
    } catch {
        // fcm_token 삭제 실패해도 로그아웃 진행
    }
    try {
        await authApi.post('/auth/logout');
    } catch {
        // 로그아웃 요청 실패해도 로컬 상태는 정리
    } finally {
        clearAccessToken();
        await persistentStorage.remove('session_hint');
        await persistentStorage.removeSecure('access_token');
        isAuthInitialized = false;
    }
};

// 인증 상태 초기화 (테스트용)
export const resetAuthState = async (): Promise<void> => {
    isAuthInitialized = false;
    initializationPromise = null;
    clearAccessToken();
    await persistentStorage.remove('session_hint');
    await persistentStorage.removeSecure('access_token');
};
