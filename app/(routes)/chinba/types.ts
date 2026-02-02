// 백엔드 API 스펙 기반 타입 정의

/**
 * 이벤트 기본 정보
 */
export interface Event {
  event_id: string; // UUID
  title: string;
  dates: string[]; // ["2024-05-20", "2024-05-21"]
  start_hour: number; // 9
  end_hour: number; // 22
  created_at?: string;
}

/**
 * 참가자 정보
 */
export interface Participant {
  participant_id: number;
  name: string;
  password?: string;
}

/**
 * 가능 시간 슬롯 (ISO string)
 */
export type AvailabilitySlot = string; // "2024-05-20T10:00:00"

/**
 * 히트맵 슬롯 데이터
 */
export interface HeatmapSlot {
  dt: string; // "2024-05-20T10:00:00"
  count: number; // 해당 시간에 가능한 사람 수
  members: string[]; // ["철수", "영희"]
}

/**
 * GET /api/events/{event_id} 응답
 */
export interface EventResponse {
  title: string;
  dates: string[];
  time_range: {
    start: number;
    end: number;
  };
  participants: Participant[];
  heatmap: HeatmapSlot[];
}

/**
 * POST /api/events 요청
 */
export interface CreateEventRequest {
  title: string;
  dates: string[];
  start_hour: number;
  end_hour: number;
}

/**
 * POST /api/events 응답
 */
export interface CreateEventResponse {
  event_id: string;
  link: string;
}

/**
 * POST /api/events/{event_id}/participants 요청
 */
export interface JoinEventRequest {
  name: string;
  password?: string;
}

/**
 * POST /api/events/{event_id}/participants 응답
 */
export interface JoinEventResponse {
  participant_id: number;
  token: string;
}

/**
 * PUT /api/participants/{participant_id}/availability 요청
 */
export interface UpdateAvailabilityRequest {
  slots: AvailabilitySlot[];
}

/**
 * 요일 타입
 */
export type DayOfWeek = '월' | '화' | '수' | '목' | '금' | '토' | '일';

/**
 * 시간 선택 모드
 */
export type TimeSelectionMode = 'grid' | 'direct';

/**
 * FREE TIME 구간
 */
export interface FreeTimeSlot {
  day: DayOfWeek;
  date: string; // "2024-05-20"
  startTime: string; // "10:00"
  endTime: string; // "12:00"
  dt: string; // "2024-05-20T10:00:00" (스크롤용)
}
