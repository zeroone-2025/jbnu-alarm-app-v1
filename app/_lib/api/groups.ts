import api from './client'
import type {
  GroupsListResponse,
  GroupsSaveRequest,
  GroupParseRequest,
  GroupParseResponse,
  Group,
  GroupSet,
  GroupSetsListResponse,
  GroupSetCreateRequest,
} from '@/_types/team'

export async function parseGroups(teamId: number, data: GroupParseRequest): Promise<GroupParseResponse> {
  const res = await api.post(`/chinba/teams/${teamId}/groups/parse`, data, { timeout: 30000 })
  return res.data
}

export async function saveGroups(teamId: number, data: GroupsSaveRequest): Promise<{ groups: Group[] }> {
  const res = await api.put(`/chinba/teams/${teamId}/groups`, data)
  return res.data
}

export async function getGroups(teamId: number, groupSetId?: number): Promise<GroupsListResponse> {
  const res = await api.get(`/chinba/teams/${teamId}/groups`, {
    params: groupSetId != null ? { group_set_id: groupSetId } : undefined,
  })
  return res.data
}

export async function changeGroupLeader(teamId: number, groupId: number, memberId: number): Promise<void> {
  await api.patch(`/chinba/teams/${teamId}/groups/${groupId}/leader`, { member_id: memberId })
}

export async function getGroupSets(teamId: number): Promise<GroupSetsListResponse> {
  const res = await api.get(`/chinba/teams/${teamId}/group-sets`)
  return res.data
}

export async function createGroupSet(teamId: number, data: GroupSetCreateRequest): Promise<GroupSet> {
  const res = await api.post(`/chinba/teams/${teamId}/group-sets`, data)
  return res.data
}

export async function updateGroupSet(teamId: number, setId: number, data: GroupSetCreateRequest): Promise<GroupSet> {
  const res = await api.put(`/chinba/teams/${teamId}/group-sets/${setId}`, data)
  return res.data
}

export async function deleteGroupSet(teamId: number, setId: number): Promise<void> {
  await api.delete(`/chinba/teams/${teamId}/group-sets/${setId}`)
}
