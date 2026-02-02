'use client';

import { useState, useCallback } from 'react';
import { generateSlotRange } from '../lib/utils';
import type { AvailabilitySlot, TimeSelectionMode } from '../types';

interface UseTimeSelectionReturn {
  selectedSlots: Set<AvailabilitySlot>;
  mode: TimeSelectionMode;
  isDragging: boolean;
  setMode: (mode: TimeSelectionMode) => void;
  toggleSlot: (slot: AvailabilitySlot) => void;
  addSlotRange: (date: string, startTime: string, endTime: string) => void;
  removeSlot: (slot: AvailabilitySlot) => void;
  clearSlots: () => void;
  setSlots: (slots: AvailabilitySlot[]) => void;
  handleMouseDown: (slot: AvailabilitySlot) => void;
  handleMouseEnter: (slot: AvailabilitySlot) => void;
  handleMouseUp: () => void;
}

/**
 * 시간 선택 상태 관리 훅
 */
export function useTimeSelection(
  initialSlots: AvailabilitySlot[] = []
): UseTimeSelectionReturn {
  const [selectedSlots, setSelectedSlots] = useState<Set<AvailabilitySlot>>(
    new Set(initialSlots)
  );
  const [mode, setMode] = useState<TimeSelectionMode>('grid');
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'add' | 'remove'>('add');

  // 단일 슬롯 토글
  const toggleSlot = useCallback((slot: AvailabilitySlot) => {
    setSelectedSlots((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(slot)) {
        newSet.delete(slot);
      } else {
        newSet.add(slot);
      }
      return newSet;
    });
  }, []);

  // 시간 범위 추가 (직접 작성 모드)
  const addSlotRange = useCallback(
    (date: string, startTime: string, endTime: string) => {
      const slots = generateSlotRange(date, startTime, endTime);
      setSelectedSlots((prev) => {
        const newSet = new Set(prev);
        slots.forEach((slot) => newSet.add(slot));
        return newSet;
      });
    },
    []
  );

  // 단일 슬롯 제거
  const removeSlot = useCallback((slot: AvailabilitySlot) => {
    setSelectedSlots((prev) => {
      const newSet = new Set(prev);
      newSet.delete(slot);
      return newSet;
    });
  }, []);

  // 모든 슬롯 초기화
  const clearSlots = useCallback(() => {
    setSelectedSlots(new Set());
  }, []);

  // 슬롯 일괄 설정
  const setSlots = useCallback((slots: AvailabilitySlot[]) => {
    setSelectedSlots(new Set(slots));
  }, []);

  // 드래그 시작
  const handleMouseDown = useCallback(
    (slot: AvailabilitySlot) => {
      setIsDragging(true);
      const isSelected = selectedSlots.has(slot);
      setDragMode(isSelected ? 'remove' : 'add');
      toggleSlot(slot);
    },
    [selectedSlots, toggleSlot]
  );

  // 드래그 중
  const handleMouseEnter = useCallback(
    (slot: AvailabilitySlot) => {
      if (!isDragging) return;

      setSelectedSlots((prev) => {
        const newSet = new Set(prev);
        if (dragMode === 'add') {
          newSet.add(slot);
        } else {
          newSet.delete(slot);
        }
        return newSet;
      });
    },
    [isDragging, dragMode]
  );

  // 드래그 종료
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    selectedSlots,
    mode,
    isDragging,
    setMode,
    toggleSlot,
    addSlotRange,
    removeSlot,
    clearSlots,
    setSlots,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
  };
}
