'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyChinbaEvents,
  getChinbaEventDetail,
  getChinbaMyParticipation,
  createChinbaEvent,
  updateChinbaUnavailability,
  importChinbaTimetable,
  deleteChinbaEvent,
  completeChinbaEvent,
} from '@/_lib/api/chinba';
import type {
  ChinbaEventCreateRequest,
  ChinbaUnavailabilityUpdateRequest,
} from '@/_types/chinba';

export function useMyChinbaEvents() {
  return useQuery({
    queryKey: ['chinba', 'my-events'],
    queryFn: getMyChinbaEvents,
    staleTime: 1000 * 60 * 5,
  });
}

export function useChinbaEventDetail(eventId: string | undefined) {
  return useQuery({
    queryKey: ['chinba', 'event', eventId],
    queryFn: () => getChinbaEventDetail(eventId!),
    enabled: !!eventId,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  });
}

export function useMyParticipation(eventId: string | undefined) {
  return useQuery({
    queryKey: ['chinba', 'participation', eventId],
    queryFn: () => getChinbaMyParticipation(eventId!),
    enabled: !!eventId,
    staleTime: 1000 * 30,
  });
}

export function useCreateChinbaEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ChinbaEventCreateRequest) => createChinbaEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chinba', 'my-events'] });
    },
  });
}

export function useUpdateUnavailability(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ChinbaUnavailabilityUpdateRequest) =>
      updateChinbaUnavailability(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chinba', 'event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['chinba', 'participation', eventId] });
    },
  });
}

export function useImportTimetable(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => importChinbaTimetable(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chinba', 'event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['chinba', 'participation', eventId] });
    },
  });
}

export function useDeleteChinbaEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => deleteChinbaEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chinba', 'my-events'] });
    },
  });
}

export function useCompleteChinbaEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => completeChinbaEvent(eventId),
    onSuccess: (_data, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['chinba', 'event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['chinba', 'my-events'] });
    },
  });
}
