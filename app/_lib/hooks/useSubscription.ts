'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSubscription,
  createSubscription,
  cancelSubscription,
} from '@/_lib/api/subscriptions';
import type { SubscriptionCreateRequest } from '@/_types/team';

export function useSubscription(teamId: number | undefined) {
  return useQuery({
    queryKey: ['teams', teamId, 'subscription'],
    queryFn: () => getSubscription(teamId!),
    enabled: !!teamId,
    staleTime: 1000 * 30,
  });
}

export function useCreateSubscription(teamId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SubscriptionCreateRequest) => createSubscription(teamId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams', teamId, 'subscription'] });
      qc.invalidateQueries({ queryKey: ['teams', teamId] });
      qc.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useCancelSubscription(teamId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => cancelSubscription(teamId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams', teamId, 'subscription'] });
      qc.invalidateQueries({ queryKey: ['teams', teamId] });
      qc.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}
