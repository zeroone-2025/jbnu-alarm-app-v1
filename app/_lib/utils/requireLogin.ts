/**
 * 로그인이 필요할 때 /login으로 리다이렉트하는 헬퍼
 */
export function getLoginUrl(redirectTo?: string): string {
  const path =
    redirectTo ||
    (typeof window !== 'undefined'
      ? window.location.pathname + window.location.search
      : '/');
  return `/login?redirect_to=${encodeURIComponent(path)}`;
}
