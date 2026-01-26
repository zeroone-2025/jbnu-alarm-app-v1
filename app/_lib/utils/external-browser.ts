// In-App Browser Detection & Redirection Utility

export const openLinkInExternalBrowser = (url: string) => {
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent.toLowerCase();
    console.log('[ExternalBrowser] Current UserAgent:', userAgent);

    // Ensure URL is absolute (Intent needs exact scheme)
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;

    // 1. Android Detection
    if (/android/.test(userAgent)) {
        // Detect common in-app browsers + generic WebView (; wv)
        if (
            /everytimeapp|kakaotalk|naver|instagram|fbav|line|daum|wv/i.test(userAgent) ||
            userAgent.includes('; wv')
        ) {
            console.log('[ExternalBrowser] Android In-App Browser detected. Attempting redirect via Intent.');

            const urlWithoutProtocol = fullUrl.replace(/^https?:\/\//, '');
            // Use Android Intent to force open in Chrome
            // package=com.android.chrome ensures Chrome if available, but might fail if not installed.
            const intentUrl = `intent://${urlWithoutProtocol}#Intent;scheme=https;package=com.android.chrome;end;`;

            window.location.href = intentUrl;
            return;
        }
    }

    // 2. iOS Detection
    else if (/iphone|ipad|ipod/.test(userAgent)) {
        // Detect In-App browsers
        if (
            /everytimeapp|kakaotalk|naver|instagram|fbav|line|daum/i.test(userAgent)
        ) {
            console.log('[ExternalBrowser] iOS In-App Browser detected.');
            // iOS text-based apps often treat window.open as a new window request.
            // However, some WebViews block this.
            // Try opening in a new context.
            const newWindow = window.open(fullUrl, '_system');
            if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
                // If popup blocked or failed, fallback to standard link
                window.location.href = fullUrl;
            }
            return;
        }
    }

    // 3. Desktop / Standard Browser
    console.log('[ExternalBrowser] Standard browser detected. Navigating normally.');
    window.location.href = fullUrl;
};
