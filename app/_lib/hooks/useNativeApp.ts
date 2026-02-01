'use client';
import { Capacitor } from '@capacitor/core';

/**
 * Capacitor 네이티브 앱 환경 감지 훅
 * 
 * @returns {Object} isNative - 네이티브 앱 여부, platform - 플랫폼 ('ios' | 'android' | 'web')
 */
export function useNativeApp() {
    const isNative = Capacitor.isNativePlatform();
    const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'

    return { isNative, platform };
}
