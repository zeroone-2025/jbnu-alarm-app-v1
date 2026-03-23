/**
 * In-memory Access Token 저장소
 * - JS 메모리에서 토큰 관리 (primary)
 * - Native: iOS Keychain(capacitor-secure-storage-plugin)에 영속화
 * - Web: 메모리만 (탭 닫기/새로고침 시 소멸 → refresh token 쿠키로 복구)
 */

import persistentStorage from '@/_lib/utils/persistentStorage';

const TOKEN_KEY = 'access_token';

let accessToken: string | null = null;

// single-flight 플래그: restoreAccessToken과 refreshAccessToken 동시 실행 방지
let isRestoring = false;

/**
 * Access Token 가져오기
 */
export function getAccessToken(): string | null {
    return accessToken;
}

/**
 * Access Token 설정 (async) — Keychain에도 영속화
 */
export async function setAccessToken(token: string | null): Promise<void> {
    if (token) {
        accessToken = token;
        await persistentStorage.setSecure(TOKEN_KEY, token);
    } else {
        accessToken = null;
        await persistentStorage.removeSecure(TOKEN_KEY);
    }
}

/**
 * Access Token 삭제
 */
export function clearAccessToken(): void {
    accessToken = null;
    // fire-and-forget (cleanup path — 에러 무시)
    persistentStorage.removeSecure(TOKEN_KEY).catch(() => {});
}

/**
 * Access Token 존재 여부 확인
 */
export function hasAccessToken(): boolean {
    return accessToken !== null && accessToken.length > 0;
}

/**
 * Keychain에서 토큰 복원 → 메모리에 세팅
 * @returns 복원 성공 여부
 */
export async function restoreAccessToken(): Promise<boolean> {
    if (isRestoring) return false;
    isRestoring = true;

    try {
        const token = await persistentStorage.getSecure(TOKEN_KEY);
        if (token) {
            accessToken = token;
            return true;
        }
        return false;
    } catch {
        return false;
    } finally {
        isRestoring = false;
    }
}

/**
 * 현재 single-flight 복원 중인지 여부
 */
export function isRestoringToken(): boolean {
    return isRestoring;
}
