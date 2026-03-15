'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTeamEvent,
  getTeamEvents,
  getTeamEventDetail,
  getTeamTimetables,
} from '@/_lib/api/teamEvents';
import type { TeamEventCreateRequest } from '@/_types/team';

export function useTeamEvents(teamId: number | undefined, status?: string) {
  return useQuery({
    queryKey: ['teams', teamId, 'events', status],
    queryFn: () => getTeamEvents(teamId!, { status }),
    enabled: !!teamId,
    staleTime: 1000 * 30,
  });
}

export function useTeamEventDetail(teamId: number | undefined, eventId: string | undefined) {
  return useQuery({
    queryKey: ['teams', teamId, 'events', eventId],
    queryFn: () => getTeamEventDetail(teamId!, eventId!),
    enabled: !!teamId && !!eventId,
    staleTime: 1000 * 30,
  });
}

export function useCreateTeamEvent(teamId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TeamEventCreateRequest) => createTeamEvent(teamId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams', teamId, 'events'] });
    },
  });
}

export function useTeamTimetables(teamId: number | undefined, groupId?: number) {
  return useQuery({
    queryKey: ['teams', teamId, 'timetables', groupId],
    queryFn: () => getTeamTimetables(teamId!, groupId),
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5,
  });
}
