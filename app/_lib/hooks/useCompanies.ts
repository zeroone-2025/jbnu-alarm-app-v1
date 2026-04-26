'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCompanies,
  getCompany,
  upsertCompanyInterest,
} from '@/_lib/api/companies';
import type {
  CompanyDetail,
  CompanyInterestRequest,
} from '@/_types/flow';

export function useCompanies() {
  return useQuery({
    queryKey: ['flow', 'companies'],
    queryFn: getCompanies,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCompany(companyId: number | null) {
  return useQuery({
    queryKey: ['flow', 'company', companyId],
    queryFn: () => getCompany(companyId as number),
    enabled: companyId !== null,
    staleTime: 1000 * 60,
  });
}

export function useUpsertCompanyInterest(companyId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CompanyInterestRequest) =>
      upsertCompanyInterest(companyId, payload),
    onSuccess: (interest) => {
      queryClient.setQueryData<CompanyDetail | undefined>(
        ['flow', 'company', companyId],
        (prev) =>
          prev
            ? {
                ...prev,
                my_interest: {
                  is_interested: interest.is_interested,
                  reason: interest.reason,
                  updated_at: interest.updated_at,
                },
              }
            : prev,
      );
    },
  });
}
