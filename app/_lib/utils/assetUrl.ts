import { API_BASE_URL } from '@/_lib/api/client';

/**
 * DB에 저장된 자산 URL을 브라우저가 접근 가능한 절대 URL로 변환.
 *
 * - 절대 URL(`http://`, `https://`)은 그대로 반환
 * - `/uploads/`로 시작하는 상대 경로는 API 서버 base URL을 prepend
 * - 그 외 상대 경로(`/images/...` 등 프론트 정적 자산)는 그대로 반환
 */
export function resolveAssetUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/uploads/')) return `${API_BASE_URL}${url}`;
  return url;
}
