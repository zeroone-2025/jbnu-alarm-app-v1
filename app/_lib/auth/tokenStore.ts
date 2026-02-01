/**
 * In-memory Access Token 저장소
 * - localStorage 대신 JS 메모리에서 토큰 관리
 * - 탭 닫기/새로고침 시 토큰은 사라지지만, refresh token(HttpOnly 쿠키)으로 복구
 */

let accessToken: string | null = null;

/**
 * Access Token 가져오기
 */
export function getAccessToken(): string | null {
    return accessToken;
}

/**
 * Access Token 설정
 */
export function setAccessToken(token: string | null): void {
    accessToken = token;
}

/**
 * Access Token 삭제
 */
export function clearAccessToken(): void {
    accessToken = null;
}

/**
 * Access Token 존재 여부 확인
 */
export function hasAccessToken(): boolean {
    return accessToken !== null && accessToken.length > 0;
}
