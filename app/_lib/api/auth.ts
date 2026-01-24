import { API_BASE_URL } from './client';

// 구글 로그인 URL 생성 (리다이렉트용)
export const getGoogleLoginUrl = () => {
    return `${API_BASE_URL}/auth/google/login`;
};

// Note: processGoogleCallback is not needed for the current OAuth flow.
// The backend handles the entire OAuth flow and redirects to /auth/callback
// with the access_token as a URL parameter.
