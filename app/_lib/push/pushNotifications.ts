import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { updateUserProfile } from '@/_lib/api/user';

export async function registerPushNotifications(): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) return null;

  let permStatus = await PushNotifications.checkPermissions();
  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }
  if (permStatus.receive !== 'granted') return null;

  await PushNotifications.register();

  return new Promise((resolve) => {
    PushNotifications.addListener('registration', async (token) => {
      try {
        await updateUserProfile({ fcm_token: token.value });
      } catch (e) {
        console.error('Failed to save push token:', e);
      }
      resolve(token.value);
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('Push registration error:', err);
      resolve(null);
    });
  });
}

export function setupPushListeners(navigateTo: (path: string) => void): void {
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push received in foreground:', notification);
    // 포그라운드에서는 시스템이 자동 표시 (presentationOptions 설정)
  });

  PushNotifications.addListener('pushNotificationActionPerformed', () => {
    navigateTo('/notifications');
  });
}
