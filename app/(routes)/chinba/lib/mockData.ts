import type {
  EventResponse,
  CreateEventResponse,
  JoinEventResponse,
  Participant,
  HeatmapSlot,
} from '../types';

/**
 * Mock 이벤트 응답 데이터
 */
export const mockEventResponse: EventResponse = {
  title: '알고리즘 스터디 시간 정하기',
  dates: ['2024-05-20', '2024-05-21', '2024-05-22', '2024-05-23', '2024-05-24', '2024-05-25', '2024-05-26'], // 월~일
  time_range: {
    start: 9,
    end: 22,
  },
  participants: [
    { participant_id: 1, name: '김민수' },
    { participant_id: 2, name: '이서연' },
    { participant_id: 3, name: '박지훈' },
  ],
  heatmap: [
    // 월요일 (2024-05-20)
    { dt: '2024-05-20T10:00:00', count: 3, members: ['김민수', '이서연', '박지훈'] },
    { dt: '2024-05-20T10:30:00', count: 3, members: ['김민수', '이서연', '박지훈'] },
    { dt: '2024-05-20T11:00:00', count: 2, members: ['김민수', '이서연'] },
    { dt: '2024-05-20T14:00:00', count: 2, members: ['김민수', '이서연'] },
    { dt: '2024-05-20T14:30:00', count: 1, members: ['김민수'] },
    
    // 화요일 (2024-05-21)
    { dt: '2024-05-21T10:00:00', count: 2, members: ['이서연', '박지훈'] },
    { dt: '2024-05-21T10:30:00', count: 2, members: ['이서연', '박지훈'] },
    { dt: '2024-05-21T15:00:00', count: 1, members: ['박지훈'] },
    
    // 수요일 (2024-05-22)
    { dt: '2024-05-22T11:00:00', count: 2, members: ['김민수', '박지훈'] },
    { dt: '2024-05-22T11:30:00', count: 2, members: ['김민수', '박지훈'] },
    { dt: '2024-05-22T16:00:00', count: 1, members: ['이서연'] },
    
    // 목요일 (2024-05-23)
    { dt: '2024-05-23T13:00:00', count: 2, members: ['김민수', '이서연'] },
    { dt: '2024-05-23T13:30:00', count: 2, members: ['김민수', '이서연'] },
    
    // 금요일 (2024-05-24)
    { dt: '2024-05-24T18:00:00', count: 3, members: ['김민수', '이서연', '박지훈'] },
    { dt: '2024-05-24T18:30:00', count: 3, members: ['김민수', '이서연', '박지훈'] },
    
    // 토요일 (2024-05-25)
    { dt: '2024-05-25T10:00:00', count: 2, members: ['이서연', '박지훈'] },
    { dt: '2024-05-25T10:30:00', count: 2, members: ['이서연', '박지훈'] },
    
    // 일요일 (2024-05-26)
    { dt: '2024-05-26T14:00:00', count: 1, members: ['김민수'] },
    { dt: '2024-05-26T14:30:00', count: 1, members: ['김민수'] },
  ],
};

/**
 * localStorage 키
 */
const STORAGE_KEYS = {
  EVENTS: 'chinba_events',
  PARTICIPANTS: 'chinba_participants',
  CURRENT_PARTICIPANT: 'chinba_current_participant',
  AVAILABILITIES: 'chinba_availabilities',
};

/**
 * Mock API: 이벤트 조회
 */
export function getEvent(eventId: string): EventResponse | null {
  if (eventId === 'test-event') {
    // localStorage에서 동적 데이터 가져오기
    const storedParticipants = localStorage.getItem(
      `${STORAGE_KEYS.PARTICIPANTS}_${eventId}`
    );
    const storedHeatmap = localStorage.getItem(
      `${STORAGE_KEYS.AVAILABILITIES}_${eventId}`
    );
    
    return {
      ...mockEventResponse,
      participants: storedParticipants
        ? JSON.parse(storedParticipants)
        : mockEventResponse.participants,
      heatmap: storedHeatmap
        ? JSON.parse(storedHeatmap)
        : mockEventResponse.heatmap,
    };
  }
  return null;
}

/**
 * Mock API: 이벤트 생성
 */
export function createEvent(
  title: string,
  dates: string[],
  startHour: number,
  endHour: number
): CreateEventResponse {
  const eventId = Math.random().toString(36).substring(2, 9);
  
  const event = {
    event_id: eventId,
    title,
    dates,
    start_hour: startHour,
    end_hour: endHour,
    created_at: new Date().toISOString(),
  };
  
  // localStorage에 저장
  const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '{}');
  events[eventId] = event;
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  
  return {
    event_id: eventId,
    link: `${window.location.origin}/chinba/${eventId}`,
  };
}

/**
 * Mock API: 참가자 등록
 */
export function joinEvent(
  eventId: string,
  name: string,
  password?: string
): JoinEventResponse {
  const participantId = Date.now();
  const token = Math.random().toString(36).substring(2);
  
  const participant: Participant = {
    participant_id: participantId,
    name,
    password,
  };
  
  // localStorage에 저장
  const participants = JSON.parse(
    localStorage.getItem(`${STORAGE_KEYS.PARTICIPANTS}_${eventId}`) || '[]'
  );
  participants.push(participant);
  localStorage.setItem(
    `${STORAGE_KEYS.PARTICIPANTS}_${eventId}`,
    JSON.stringify(participants)
  );
  
  // 현재 참가자 정보 저장
  localStorage.setItem(
    `${STORAGE_KEYS.CURRENT_PARTICIPANT}_${eventId}`,
    JSON.stringify({ participant_id: participantId, token, name })
  );
  
  return { participant_id: participantId, token };
}

/**
 * Mock API: 시간 등록/수정
 */
export function updateAvailability(
  eventId: string,
  participantId: number,
  slots: string[]
): void {
  const currentParticipant = JSON.parse(
    localStorage.getItem(`${STORAGE_KEYS.CURRENT_PARTICIPANT}_${eventId}`) || '{}'
  );
  
  if (!currentParticipant.name) return;
  
  // 기존 히트맵 가져오기
  const heatmap: HeatmapSlot[] = JSON.parse(
    localStorage.getItem(`${STORAGE_KEYS.AVAILABILITIES}_${eventId}`) ||
      JSON.stringify(mockEventResponse.heatmap)
  );
  
  // 현재 참가자의 기존 데이터 제거
  const filteredHeatmap = heatmap.filter(
    (slot) => !slot.members.includes(currentParticipant.name)
  );
  
  // 새로운 슬롯 추가
  const heatmapMap = new Map<string, HeatmapSlot>();
  
  // 기존 데이터를 Map에 추가
  filteredHeatmap.forEach((slot) => {
    heatmapMap.set(slot.dt, slot);
  });
  
  // 새로운 슬롯 추가
  slots.forEach((dt) => {
    const existing = heatmapMap.get(dt);
    if (existing) {
      existing.count += 1;
      existing.members.push(currentParticipant.name);
    } else {
      heatmapMap.set(dt, {
        dt,
        count: 1,
        members: [currentParticipant.name],
      });
    }
  });
  
  // Map을 배열로 변환
  const updatedHeatmap = Array.from(heatmapMap.values()).sort((a, b) =>
    a.dt.localeCompare(b.dt)
  );
  
  // localStorage에 저장
  localStorage.setItem(
    `${STORAGE_KEYS.AVAILABILITIES}_${eventId}`,
    JSON.stringify(updatedHeatmap)
  );
}

/**
 * 현재 참가자 정보 가져오기
 */
export function getCurrentParticipant(eventId: string): {
  participant_id: number;
  token: string;
  name: string;
} | null {
  const data = localStorage.getItem(
    `${STORAGE_KEYS.CURRENT_PARTICIPANT}_${eventId}`
  );
  return data ? JSON.parse(data) : null;
}

/**
 * 로그아웃 (세션 삭제)
 */
export function logout(eventId: string): void {
  localStorage.removeItem(`${STORAGE_KEYS.CURRENT_PARTICIPANT}_${eventId}`);
}

/**
 * 방 나가기 (참가자 삭제)
 */
export function leaveEvent(eventId: string): void {
  const currentParticipant = getCurrentParticipant(eventId);
  if (!currentParticipant) return;
  
  // 참가자 목록에서 제거
  const participants: Participant[] = JSON.parse(
    localStorage.getItem(`${STORAGE_KEYS.PARTICIPANTS}_${eventId}`) || '[]'
  );
  const updatedParticipants = participants.filter(
    (p) => p.participant_id !== currentParticipant.participant_id
  );
  localStorage.setItem(
    `${STORAGE_KEYS.PARTICIPANTS}_${eventId}`,
    JSON.stringify(updatedParticipants)
  );
  
  // 히트맵에서 제거
  const heatmap: HeatmapSlot[] = JSON.parse(
    localStorage.getItem(`${STORAGE_KEYS.AVAILABILITIES}_${eventId}`) || '[]'
  );
  const updatedHeatmap = heatmap
    .map((slot) => ({
      ...slot,
      members: slot.members.filter((m) => m !== currentParticipant.name),
      count: slot.members.filter((m) => m !== currentParticipant.name).length,
    }))
    .filter((slot) => slot.count > 0);
  localStorage.setItem(
    `${STORAGE_KEYS.AVAILABILITIES}_${eventId}`,
    JSON.stringify(updatedHeatmap)
  );
  
  // 세션 삭제
  logout(eventId);
}
