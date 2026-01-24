import axios from 'axios';

// 백엔드 API 주소 (환경 변수에서 가져옴)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Axios 인스턴스 생성
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000, // 5초 이상 응답 없으면 에러
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
    },
});

// 요청 인터셉터: localStorage에 토큰이 있으면 Authorization 헤더에 추가
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;
