import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from '@/_lib/auth/tokenStore';

// 백엔드 API 주소 (환경 변수에서 가져옴)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// 인증용 Axios 인스턴스 (refresh 요청 등 - 인터셉터 없음)
export const authApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
    withCredentials: true, // HttpOnly 쿠키 전송
    headers: {
        'Content-Type': 'application/json',
    },
});

// 메인 Axios 인스턴스
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
    withCredentials: true, // HttpOnly 쿠키 전송
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
    },
});

// 토큰 갱신 중 여부 플래그
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// 대기 중인 요청들에게 새 토큰 전달
const onRefreshed = (token: string) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
};

// 토큰 갱신 대기열에 추가
const addRefreshSubscriber = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

// 요청 인터셉터: 메모리에서 토큰을 가져와 Authorization 헤더에 추가
api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 응답 인터셉터: 401 에러 시 토큰 갱신 후 재시도
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 401 에러이고, 재시도가 아닌 경우
        if (error.response?.status === 401 && !originalRequest._retry) {
            // 이미 갱신 중이면 대기
            if (isRefreshing) {
                return new Promise((resolve) => {
                    addRefreshSubscriber((token: string) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(api(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // 토큰 갱신 시도
                const response = await authApi.post<{ access_token: string }>('/auth/refresh');
                const newToken = response.data.access_token;

                if (newToken) {
                    setAccessToken(newToken);
                    onRefreshed(newToken);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // 갱신 실패 시 토큰 삭제
                clearAccessToken();
                refreshSubscribers = [];
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
