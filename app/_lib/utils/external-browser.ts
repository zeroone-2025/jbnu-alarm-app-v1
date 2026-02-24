export const isInAppBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent.toLowerCase();

  const inAppKeywords = ['kakaotalk', 'naver', 'everytimeapp', 'instagram', 'fbav', 'line', 'daum', 'wv', 'trill'];
  const isKnownInApp = inAppKeywords.some((keyword) => userAgent.includes(keyword));
  const isAndroidWebView = /android/.test(userAgent) && userAgent.includes('; wv');

  return isKnownInApp || isAndroidWebView;
};
