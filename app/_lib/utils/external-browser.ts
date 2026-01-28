// In-App Browser Detection & Redirection Utility

export type UserSystemType = 'android' | 'ios' | 'pc' | 'unknown';

export const getSystemType = (): UserSystemType => {
    if (typeof window === 'undefined') return 'unknown';
    const userAgent = navigator.userAgent.toLowerCase();

    if (/android/.test(userAgent)) return 'android';
    if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
    return 'pc';
};

export const isInAppBrowser = (): boolean => {
    if (typeof window === 'undefined') return false;
    const userAgent = navigator.userAgent.toLowerCase();

    // Common In-App Browser keywords
    // KakaoTalk, Naver, EverytimeApp, Instagram, Facebook, Line, Daum
    // generic 'wv' (WebView) often used by Android
    const inAppKeywords = [
        'kakaotalk', 'everytimeapp', 'instagram',
        'fbav', 'line', 'daum', 'wv', 'trill' // trill = tiktok? just covering potential bases
    ];

    const isKnownInApp = inAppKeywords.some(keyword => userAgent.includes(keyword));

    // Android specific checks for "; wv"
    const isAndroidWebView = /android/.test(userAgent) && userAgent.includes('; wv');

    return isKnownInApp || isAndroidWebView;
};
