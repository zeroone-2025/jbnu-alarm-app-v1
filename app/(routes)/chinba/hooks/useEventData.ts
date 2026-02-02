'use client';

import { useState, useEffect, useCallback } from 'react';
import { getEvent, updateAvailability } from '../lib/mockData';
import type { EventResponse, AvailabilitySlot } from '../types';

interface UseEventDataReturn {
  eventData: EventResponse | null;
  isLoading: boolean;
  error: string | null;
  refreshEvent: () => void;
  saveAvailability: (participantId: number, slots: AvailabilitySlot[]) => void;
}

/**
 * 이벤트 데이터 관리 훅
 */
export function useEventData(eventId: string): UseEventDataReturn {
  const [eventData, setEventData] = useState<EventResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 이벤트 데이터 로드
  const loadEvent = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      const data = getEvent(eventId);
      
      if (!data) {
        setError('이벤트를 찾을 수 없습니다.');
        return;
      }
      
      setEventData(data);
    } catch (err) {
      setError('이벤트 로드 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  // 초기 로드
  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  // 이벤트 새로고침
  const refreshEvent = useCallback(() => {
    loadEvent();
  }, [loadEvent]);

  // 시간 저장
  const saveAvailability = useCallback(
    (participantId: number, slots: AvailabilitySlot[]) => {
      try {
        updateAvailability(eventId, participantId, slots);
        // 저장 후 이벤트 데이터 새로고침 (히트맵 업데이트)
        refreshEvent();
      } catch (err) {
        console.error('Failed to save availability:', err);
        throw err;
      }
    },
    [eventId, refreshEvent]
  );

  return {
    eventData,
    isLoading,
    error,
    refreshEvent,
    saveAvailability,
  };
}
