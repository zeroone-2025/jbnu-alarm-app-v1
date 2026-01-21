import axios from 'axios';

// 백엔드 API 주소 (환경 변수에서 가져옴)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초 이상 응답 없으면 에러
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
  board_code: string; // 게시판 코드 (category에서 변경)
  created_at: string; // 데이터 수집 시각 (백엔드 NoticeResponse와 일치)
  is_read: boolean; // 읽음 여부 (백엔드에서 제공)
  view: number; // 조회수
  is_favorite: boolean; // 즐겨찾기 여부
  matched_keywords?: string[]; // 매칭된 키워드 목록 (삭제된 키워드 포함)
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

// 공지사항 즐겨찾기 토글
export const toggleNoticeFavorite = async (noticeId: number) => {
  const response = await api.post<{
    message: string;
    notice_id: number;
    is_favorite: boolean;
  }>(`/notices/${noticeId}/favorite`);
  return response.data;
};

// 공지사항 조회수 증가 (로그인 필수, 최대 3회까지)
export const incrementNoticeView = async (noticeId: number) => {
  const response = await api.post<{
    notice_id: number;
    view: number;
    user_view_count: number;
    message: string;
  }>(`/notices/${noticeId}/increment-view`);
  return response.data;
};

// ==================== User Profile ====================

// 사용자 정보 인터페이스
export interface UserProfile {
  id: number;
  email: string;
  username: string | null;
  nickname: string | null;
  dept_code: string | null;
  school: string;
  profile_image: string | null;
  created_at: string;
}

// 내 정보 조회
export const getUserProfile = async () => {
  const response = await api.get<UserProfile>('/users/me');
  return response.data;
};

// 사용자 정보 업데이트 인터페이스
export interface UserProfileUpdate {
  nickname?: string;
  dept_code?: string;
  fcm_token?: string;
  profile_image?: string;
}

// 사용자 정보 업데이트
export const updateUserProfile = async (data: UserProfileUpdate) => {
  const response = await api.patch<UserProfile>('/users/me', data);
  return response.data;
};

// ==================== User Subscriptions ====================

// 구독 정보 인터페이스
export interface UserSubscription {
  id: number;
  board_code: string;
}

// 내 구독 조회
export const getUserSubscriptions = async () => {
  const response = await api.get<UserSubscription[]>('/users/me/subscriptions');
  return response.data;
};

// 구독 업데이트 (전체 교체)
export const updateUserSubscriptions = async (boardCodes: string[]) => {
  const response = await api.put<{ message: string; subscriptions: UserSubscription[] }>(
    '/users/me/subscriptions',
    { board_codes: boardCodes }
  );
  return response.data;
};

// ==================== Keyword Notifications ====================

export interface Keyword {
  id: number;
  keyword: string;
  created_at: string;
}

// 내 키워드 조회
export const getMyKeywords = async () => {
  const response = await api.get<Keyword[]>('/users/me/keywords');
  return response.data;
};

// 키워드 추가
export const addKeyword = async (keyword: string) => {
  const response = await api.post<Keyword>('/users/me/keywords', { keyword });
  return response.data;
};

// 키워드 삭제
export const deleteKeyword = async (keywordId: number) => {
  const response = await api.delete<{ message: string; keyword_id: number }>(
    `/users/me/keywords/${keywordId}`
  );
  return response.data;
};

// 키워드 공지 목록 조회
export const getKeywordNotices = async (
  page: number = 0,
  limit: number = 20,
  includeRead: boolean = true,
) => {
  const response = await api.get<Notice[]>('/users/me/keyword-notices', {
    params: {
      skip: page * limit,
      limit,
      include_read: includeRead,
    },
  });
  return response.data;
};

// ==================== Server-side OAuth Flow ====================

// 구글 로그인 URL 생성 (리다이렉트용)
export const getGoogleLoginUrl = () => {
  return `${API_BASE_URL}/auth/google/login`;
};

// Note: processGoogleCallback is not needed for the current OAuth flow.
// The backend handles the entire OAuth flow and redirects to /auth/callback
// with the access_token as a URL parameter.

// DB 데이터 전체 초기화 (관리자용)
export const resetNotices = async () => {
  return api.delete('/notices/reset');
};

export default api;
