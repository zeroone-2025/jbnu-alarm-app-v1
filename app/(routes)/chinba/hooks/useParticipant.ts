'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  joinEvent as mockJoinEvent,
  logout as mockLogout,
  leaveEvent as mockLeaveEvent,
  getCurrentParticipant,
} from '../lib/mockData';

interface UseParticipantReturn {
  isParticipant: boolean;
  participantId: number | null;
  participantName: string | null;
  joinEvent: (name: string, password?: string) => Promise<void>;
  logout: () => void;
  leaveEvent: () => void;
  isLoading: boolean;
}

/**
 * 참가자 등록/로그인 관리 훅
 */
export function useParticipant(eventId: string): UseParticipantReturn {
  const router = useRouter();
  const [isParticipant, setIsParticipant] = useState(false);
  const [participantId, setParticipantId] = useState<number | null>(null);
  const [participantName, setParticipantName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로드: localStorage에서 세션 확인
  useEffect(() => {
    const current = getCurrentParticipant(eventId);
    if (current) {
      setIsParticipant(true);
      setParticipantId(current.participant_id);
      setParticipantName(current.name);
    }
    setIsLoading(false);
  }, [eventId]);

  // 참가하기
  const joinEvent = async (name: string, password?: string) => {
    try {
      setIsLoading(true);
      const response = mockJoinEvent(eventId, name, password);
      
      setIsParticipant(true);
      setParticipantId(response.participant_id);
      setParticipantName(name);
    } catch (error) {
      console.error('Failed to join event:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃 (세션만 삭제)
  const logout = () => {
    mockLogout(eventId);
    setIsParticipant(false);
    setParticipantId(null);
    setParticipantName(null);
  };

  // 방 나가기 (참가자 삭제 + 입구로 이동)
  const leaveEvent = () => {
    mockLeaveEvent(eventId);
    setIsParticipant(false);
    setParticipantId(null);
    setParticipantName(null);
    router.push('/chinba');
  };

  return {
    isParticipant,
    participantId,
    participantName,
    joinEvent,
    logout,
    leaveEvent,
    isLoading,
  };
}
