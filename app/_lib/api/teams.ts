import api from './client';
import type {
  Team,
  TeamListItem,
  TeamDetail,
  TeamMember,
  TeamMemberListResponse,
  TeamCreateRequest,
  TeamUpdateRequest,
  JoinTeamRequest,
  JoinTeamResponse,
  InvitationInfo,
  CaptainTransferRequest,
} from '@/_types/team';

export async function createTeam(data: TeamCreateRequest): Promise<Team> {
  const res = await api.post('/chinba/teams', data);
  return res.data;
}

export async function getMyTeams(): Promise<{ teams: TeamListItem[] }> {
  const res = await api.get('/chinba/teams');
  return res.data;
}

export async function getTeamDetail(teamId: number): Promise<TeamDetail> {
  const res = await api.get(`/chinba/teams/${teamId}`);
  return res.data;
}

export async function updateTeam(teamId: number, data: TeamUpdateRequest): Promise<TeamDetail> {
  const res = await api.patch(`/chinba/teams/${teamId}`, data);
  return res.data;
}

export async function deleteTeam(teamId: number): Promise<{ message: string }> {
  const res = await api.delete(`/chinba/teams/${teamId}`);
  return res.data;
}

export async function getTeamMembers(teamId: number, role?: string): Promise<TeamMemberListResponse> {
  const params = role ? { role } : undefined;
  const res = await api.get(`/chinba/teams/${teamId}/members`, { params });
  return res.data;
}

export async function changeRole(teamId: number, memberId: number, role: string): Promise<TeamMember> {
  const res = await api.patch(`/chinba/teams/${teamId}/members/${memberId}/role`, { role });
  return res.data;
}

export async function transferCaptain(teamId: number, data: CaptainTransferRequest): Promise<any> {
  const res = await api.post(`/chinba/teams/${teamId}/captain-transfer`, data);
  return res.data;
}

export async function removeMember(teamId: number, memberId: number): Promise<{ message: string }> {
  const res = await api.delete(`/chinba/teams/${teamId}/members/${memberId}`);
  return res.data;
}

export async function leaveTeam(teamId: number): Promise<{ message: string }> {
  const res = await api.delete(`/chinba/teams/${teamId}/members/me`);
  return res.data;
}

export async function joinTeam(data: JoinTeamRequest): Promise<JoinTeamResponse> {
  const res = await api.post('/chinba/teams/join', data);
  return res.data;
}

export async function getInvitations(teamId: number): Promise<InvitationInfo> {
  const res = await api.get(`/chinba/teams/${teamId}/invitations`);
  return res.data;
}

export async function regenerateInviteCode(teamId: number): Promise<InvitationInfo> {
  const res = await api.post(`/chinba/teams/${teamId}/invitations/regenerate`);
  return res.data;
}
