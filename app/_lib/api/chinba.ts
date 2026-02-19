import api from './client';
import type {
  ChinbaEventDetail,
  ChinbaMyParticipation,
  ChinbaEventListItem,
  ChinbaEventCreateRequest,
  ChinbaEventCreateResponse,
  ChinbaUnavailabilityUpdateRequest,
} from '@/_types/chinba';

export async function createChinbaEvent(data: ChinbaEventCreateRequest): Promise<ChinbaEventCreateResponse> {
  const res = await api.post('/chinba/events', data);
  return res.data;
}

export async function getChinbaEventDetail(eventId: string): Promise<ChinbaEventDetail> {
  const res = await api.get(`/chinba/events/${eventId}`);
  return res.data;
}

export async function getChinbaMyParticipation(eventId: string): Promise<ChinbaMyParticipation> {
  const res = await api.get(`/chinba/events/${eventId}/my-participation`);
  return res.data;
}

export async function updateChinbaUnavailability(
  eventId: string,
  data: ChinbaUnavailabilityUpdateRequest
): Promise<void> {
  await api.put(`/chinba/events/${eventId}/my-unavailability`, data);
}

export async function importChinbaTimetable(eventId: string): Promise<{ message: string; imported_count: number }> {
  const res = await api.post(`/chinba/events/${eventId}/import-timetable`);
  return res.data;
}

export async function getMyChinbaEvents(): Promise<ChinbaEventListItem[]> {
  const res = await api.get('/chinba/my-events');
  return res.data;
}

export async function deleteChinbaEvent(eventId: string): Promise<void> {
  await api.delete(`/chinba/events/${eventId}`);
}

export async function completeChinbaEvent(eventId: string): Promise<void> {
  await api.patch(`/chinba/events/${eventId}/complete`);
}
