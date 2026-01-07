import axios from 'axios';

// 백엔드 API 주소 (환경 변수에서 가져옴)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // 5초 이상 응답 없으면 에러
  headers: {
    'Content-Type': 'application/json',
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

// 공지사항 데이터 타입 정의 (백엔드 모델과 일치)
export interface Notice {
  id: number;
  title: string;
  link: string;
  date: string;
  category: string;
  crawled_at: string;
  is_read: boolean; // 읽음 여부 (백엔드에서 제공)
}

// API 함수들 정리
export const fetchNotices = async (
  page: number = 0,
  limit: number = 20,
  includeRead: boolean = false, // 기본값: 안 읽은 공지만 조회
) => {
  const response = await api.get<Notice[]>('/notices', {
    params: {
      skip: page * limit,
      limit,
      include_read: includeRead, // Backend에 필터링 파라미터 전달
    },
  });
  return response.data;
};

// 수동 크롤링 트리거
export const triggerCrawl = async () => {
  return api.post('/notices/crawl');
};

// 공지사항 읽음 처리
export const markNoticeAsRead = async (noticeId: number) => {
  const response = await api.post<{
    message: string;
    notice_id: number;
    is_read: boolean;
  }>(`/notices/${noticeId}/read`);
  return response.data;
};

// 구글 로그인 URL (Redirect용)
export const getGoogleLoginUrl = (redirectUri?: string) => {
  const url = new URL(`${API_BASE_URL}/auth/google/login`);
  if (redirectUri) {
    url.searchParams.append('redirect_uri', redirectUri);
  }
  return url.toString();
};

// 구글 인증 콜백 처리 (JWT 발급 등)
export const processGoogleCallback = async (code: string) => {
  const response = await api.get('/auth/google/callback', {
    params: { code },
  });
  return response.data;
};

// DB 데이터 전체 초기화 (관리자용)
export const resetNotices = async () => {
  return api.delete('/notices/reset');
};

export default api;
