import axios from "axios";

// 백엔드 API 주소 (나중에 배포할 때 여기만 바꾸면 됨)
const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // 5초 이상 응답 없으면 에러
  headers: {
    "Content-Type": "application/json",
  },
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
  includeRead: boolean = false // 기본값: 안 읽은 공지만 조회
) => {
  const response = await api.get<Notice[]>("/notices", {
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
  return api.post("/notices/crawl");
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

// 사용자 설정 조회
export const fetchUserConfig = async () => {
  const response = await api.get<{ include_read: boolean }>('/user/config');
  return response.data;
};

// 사용자 설정 업데이트
export const updateUserConfig = async (includeRead: boolean) => {
  const response = await api.patch<{
    message: string;
    include_read: boolean;
  }>('/user/config', { include_read: includeRead });
  return response.data;
};

export default api;
