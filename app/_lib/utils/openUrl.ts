import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

/**
 * 플랫폼별 URL 오픈 유틸 (공지사항 링크 전용)
 * - Native: SFSafariViewController (iOS) / Chrome Custom Tabs (Android)
 * - Web: window.open
 *
 * OAuth 콜백 흐름(GoogleLoginButton.tsx)과 분리된 별도 유틸
 */
export async function openUrl(url: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Browser.open({
      url,
      presentationStyle: 'fullscreen', // popover는 iPhone에서 예측불가
    });
  } else {
    window.open(url, '_blank', 'noreferrer');
  }
}
