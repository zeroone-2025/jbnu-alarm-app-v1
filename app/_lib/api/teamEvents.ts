import api from './client';
import type {
  TeamEvent,
  TeamEventCreateRequest,
  TeamEventListResponse,
  TeamEventDetail,
  TimetableEntry,
} from '@/_types/team';

export async function createTeamEvent(
  teamId: number,
  data: TeamEventCreateRequest,
): Promise<{ event_id: string; title: string; team_id: number; target_groups: { id: number; name: string }[]; participant_count: number; created_at: string }> {
  const res = await api.post(`/chinba/teams/${teamId}/events`, data);
  return res.data;
}

export async function getTeamEvents(
  teamId: number,
  params?: { status?: string; skip?: number; limit?: number },
): Promise<TeamEventListResponse> {
  const res = await api.get(`/chinba/teams/${teamId}/events`, {
    params: {
      event_status: params?.status,
      skip: params?.skip,
      limit: params?.limit,
    },
  });
  return res.data;
}

export async function getTeamEventDetail(
  teamId: number,
  eventId: string,
): Promise<TeamEventDetail> {
  const res = await api.get(`/chinba/teams/${teamId}/events/${eventId}`);
  return res.data;
}

export async function getTeamTimetables(
  teamId: number,
  groupId?: number,
): Promise<{ timetables: TimetableEntry[] }> {
  const params = groupId ? { group_id: groupId } : undefined;
  const res = await api.get(`/chinba/teams/${teamId}/timetables`, { params });
  return res.data;
}
