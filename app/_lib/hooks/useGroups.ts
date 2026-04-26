'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getGroups, saveGroups, parseGroups, changeGroupLeader, getGroupSets, createGroupSet, updateGroupSet, deleteGroupSet } from '@/_lib/api/groups'
import { hasAccessToken } from '@/_lib/auth/tokenStore'
import type { GroupsSaveRequest, GroupParseRequest, GroupSetCreateRequest } from '@/_types/team'

export function useGroups(teamId: number | undefined, groupSetId?: number) {
  return useQuery({
    queryKey: ['teams', teamId, 'groups', groupSetId],
    queryFn: () => getGroups(teamId!, groupSetId),
    enabled: !!teamId && hasAccessToken(),
  })
}

export function useParseGroups(teamId: number) {
  return useMutation({
    mutationFn: (data: GroupParseRequest) => parseGroups(teamId, data),
  })
}

export function useSaveGroups(teamId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: GroupsSaveRequest) => saveGroups(teamId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams', teamId, 'groups'] })
      qc.invalidateQueries({ queryKey: ['teams', teamId, 'group-sets'] })
      qc.invalidateQueries({ queryKey: ['teams', teamId] })
    },
  })
}

export function useChangeGroupLeader(teamId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: number; memberId: number }) =>
      changeGroupLeader(teamId, groupId, memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams', teamId, 'groups'] })
    },
  })
}

export function useGroupSets(teamId: number | undefined) {
  return useQuery({
    queryKey: ['teams', teamId, 'group-sets'],
    queryFn: () => getGroupSets(teamId!),
    enabled: !!teamId && hasAccessToken(),
  })
}

export function useCreateGroupSet(teamId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: GroupSetCreateRequest) => createGroupSet(teamId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams', teamId, 'group-sets'] })
    },
  })
}

export function useUpdateGroupSet(teamId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ setId, data }: { setId: number; data: GroupSetCreateRequest }) =>
      updateGroupSet(teamId, setId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams', teamId, 'group-sets'] })
    },
  })
}

export function useDeleteGroupSet(teamId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (setId: number) => deleteGroupSet(teamId, setId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams', teamId, 'group-sets'] })
      qc.invalidateQueries({ queryKey: ['teams', teamId, 'groups'] })
    },
  })
}
