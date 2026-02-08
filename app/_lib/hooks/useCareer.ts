'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyCareer,
  saveCareerContact,
  saveCareerEducations,
  saveCareerWorks,
  saveCareerSkills,
  saveCareerCertifications,
  saveCareerActivities,
  saveCareerMentorQnA,
} from '@/_lib/api/career';
import type {
  CareerContactUpdate,
  CareerEducationsUpdate,
  CareerWorksUpdate,
  CareerSkillsUpdate,
  CareerCertificationsUpdate,
  CareerActivitiesUpdate,
  CareerMentorQnAUpdate,
} from '@/_types/career';

export function useCareer() {
  return useQuery({
    queryKey: ['career', 'my-profile'],
    queryFn: getMyCareer,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useSaveCareerContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CareerContactUpdate) => saveCareerContact(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['career', 'my-profile'], updatedProfile);
    },
  });
}

export function useSaveCareerEducations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CareerEducationsUpdate) => saveCareerEducations(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['career', 'my-profile'], updatedProfile);
    },
  });
}

export function useSaveCareerWorks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CareerWorksUpdate) => saveCareerWorks(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['career', 'my-profile'], updatedProfile);
    },
  });
}

export function useSaveCareerSkills() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CareerSkillsUpdate) => saveCareerSkills(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['career', 'my-profile'], updatedProfile);
    },
  });
}

export function useSaveCareerCertifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CareerCertificationsUpdate) => saveCareerCertifications(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['career', 'my-profile'], updatedProfile);
    },
  });
}

export function useSaveCareerActivities() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CareerActivitiesUpdate) => saveCareerActivities(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['career', 'my-profile'], updatedProfile);
    },
  });
}

export function useSaveCareerMentorQnA() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CareerMentorQnAUpdate) => saveCareerMentorQnA(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['career', 'my-profile'], updatedProfile);
    },
  });
}
