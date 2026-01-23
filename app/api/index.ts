import axios from 'axios';

// 백엔드 API 주소 (환경 변수에서 가져옴)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // 5초 이상 응답 없으면 에러
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 전송 활성화 (Refresh Token용)
});

// Access Token 메모리 저장소
let accessToken: string | null = null;

// Access Token 설정 함수 (로그인 시 호출)
export const setAccessToken = (token: string) => {
  accessToken = token;
};

// Access Token 조회 함수
export const getAccessToken = () => {
  return accessToken;
};

// Access Token 삭제 함수 (로그아웃 시 호출)
export const clearAccessToken = () => {
  accessToken = null;
};

// 토큰 갱신 중복 방지 플래그
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// 토큰 갱신 완료 시 대기 중인 요청들에게 새 토큰 전달
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// 토큰 갱신 대기 큐에 추가
const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// 요청 인터셉터: 메모리의 Access Token을 Authorization 헤더에 추가
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined' && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// 응답 인터셉터: 401 에러 시 자동 토큰 갱신
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized && 재시도 안 한 요청 && /auth/refresh가 아닌 경우
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh'
    ) {
      if (isRefreshing) {
        // 이미 갱신 중이면 대기 후 재시도
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axios(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh Token으로 새 Access Token 발급
        const { data } = await axios.post<{ access_token: string; token_type: string }>(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true, // 쿠키의 refresh_token 전송
          }
        );

        const newAccessToken = data.access_token;

        // 새 Access Token 저장
        setAccessToken(newAccessToken);

        // 대기 중인 요청들에게 새 토큰 전달
        onTokenRefreshed(newAccessToken);

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh Token도 만료된 경우 → 로그아웃 처리
        clearAccessToken();

        // 로그인 페이지로 리다이렉트 (현재 페이지 저장)
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/?redirect=${encodeURIComponent(currentPath)}`;
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

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
