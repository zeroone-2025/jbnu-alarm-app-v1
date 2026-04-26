import api from './client';
import type {
  SubscriptionDetail,
  SubscriptionCreateRequest,
  SubscriptionCreateResponse,
} from '@/_types/team';

export async function getSubscription(teamId: number): Promise<SubscriptionDetail> {
  const res = await api.get(`/chinba/teams/${teamId}/subscription`);
  return res.data;
}

export async function createSubscription(
  teamId: number,
  data: SubscriptionCreateRequest,
): Promise<SubscriptionCreateResponse> {
  const res = await api.post(`/chinba/teams/${teamId}/subscription`, data);
  return res.data;
}

export async function cancelSubscription(
  teamId: number,
): Promise<{ message: string; expires_at: string | null }> {
  const res = await api.delete(`/chinba/teams/${teamId}/subscription`);
  return res.data;
}
