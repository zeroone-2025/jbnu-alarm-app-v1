export const openLinkInExternalBrowser = (url: string) => {
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent.toLowerCase();

    // Android In-App Browser Detection & Redirection
    if (/android/.test(userAgent)) {
        // Common In-App Browsers in Korea
        if (/everytimeapp|kakaotalk|naver|instagram|fbav|line|daum/i.test(userAgent)) {
            const urlWithoutProtocol = url.replace(/^https?:\/\//, '');
            // Use Android Intent to force open in Chrome
            // This is the standard way to "break out" of a WebView on Android
            window.location.href = `intent://${urlWithoutProtocol}#Intent;scheme=https;package=com.android.chrome;end;`;
            return;
        }
    }

    // iOS In-App Browser Detection & Redirection
    else if (/iphone|ipad|ipod/.test(userAgent)) {
        // For iOS, detected In-App browsers
        if (/everytimeapp|kakaotalk|naver|instagram|fbav|line|daum/i.test(userAgent)) {
            // Attempt to open in a new tab/window, which often triggers external browser or SFSafariVC
            // depending on the host app's policy. 
            // Note: If the app strictly blocks this, there is no programmatic way from the web side 
            // other than asking the user.
            window.open(url, '_external');
            return;
        }
    }

    // Default behavior: Standard navigation
    window.location.href = url;
};
