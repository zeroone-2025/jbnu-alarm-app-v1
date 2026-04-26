import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  },
}));

import api from './client';
import {
  createTeam,
  getMyTeams,
  getTeamDetail,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  changeRole,
  transferCaptain,
  removeMember,
  leaveTeam,
  joinTeam,
  getInvitations,
  regenerateInviteCode,
} from './teams';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createTeam', () => {
  it('sends POST /chinba/teams with body', async () => {
    const mockTeam = {
      id: 1,
      name: '테스트팀',
      description: null,
      category: null,
      invite_code: 'abc12345',
      member_count: 1,
      my_role: 'captain',
      status: 'active',
      created_at: '2026-03-15',
    };
    vi.mocked(api.post).mockResolvedValue({ data: mockTeam });

    const result = await createTeam({ name: '테스트팀' });

    expect(api.post).toHaveBeenCalledWith('/chinba/teams', { name: '테스트팀' });
    expect(result.id).toBe(1);
    expect(result.my_role).toBe('captain');
  });
});

describe('getMyTeams', () => {
  it('sends GET /chinba/teams', async () => {
    const mockResponse = { teams: [{ id: 1, name: '팀1', member_count: 5 }] };
    vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

    const result = await getMyTeams();

    expect(api.get).toHaveBeenCalledWith('/chinba/teams');
    expect(result.teams).toHaveLength(1);
  });
});

describe('getTeamDetail', () => {
  it('sends GET /chinba/teams/:teamId', async () => {
    const mockDetail = { id: 1, name: '팀1', my_role: 'captain' };
    vi.mocked(api.get).mockResolvedValue({ data: mockDetail });

    const result = await getTeamDetail(1);

    expect(api.get).toHaveBeenCalledWith('/chinba/teams/1');
    expect(result.id).toBe(1);
  });
});

describe('updateTeam', () => {
  it('sends PATCH /chinba/teams/:teamId with body', async () => {
    const mockDetail = { id: 1, name: '수정된팀', my_role: 'captain' };
    vi.mocked(api.patch).mockResolvedValue({ data: mockDetail });

    const result = await updateTeam(1, { name: '수정된팀' });

    expect(api.patch).toHaveBeenCalledWith('/chinba/teams/1', { name: '수정된팀' });
    expect(result.name).toBe('수정된팀');
  });
});

describe('deleteTeam', () => {
  it('sends DELETE /chinba/teams/:teamId', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: { message: '삭제 완료' } });

    const result = await deleteTeam(1);

    expect(api.delete).toHaveBeenCalledWith('/chinba/teams/1');
    expect(result.message).toBe('삭제 완료');
  });
});

describe('getTeamMembers', () => {
  it('sends GET /chinba/teams/:teamId/members without role filter', async () => {
    const mockResponse = { members: [], total: 0 };
    vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

    const result = await getTeamMembers(1);

    expect(api.get).toHaveBeenCalledWith('/chinba/teams/1/members', { params: undefined });
    expect(result.total).toBe(0);
  });

  it('sends GET /chinba/teams/:teamId/members with role filter', async () => {
    const mockResponse = { members: [], total: 0 };
    vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

    await getTeamMembers(1, 'captain');

    expect(api.get).toHaveBeenCalledWith('/chinba/teams/1/members', { params: { role: 'captain' } });
  });
});

describe('changeRole', () => {
  it('sends PATCH /chinba/teams/:teamId/members/:memberId/role', async () => {
    const mockMember = { id: 2, user_id: 10, role: 'executive' };
    vi.mocked(api.patch).mockResolvedValue({ data: mockMember });

    const result = await changeRole(1, 2, 'executive');

    expect(api.patch).toHaveBeenCalledWith('/chinba/teams/1/members/2/role', { role: 'executive' });
    expect(result.role).toBe('executive');
  });
});

describe('transferCaptain', () => {
  it('sends POST /chinba/teams/:teamId/captain-transfer', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { message: '이양 완료' } });

    const result = await transferCaptain(1, { new_captain_member_id: 5 });

    expect(api.post).toHaveBeenCalledWith('/chinba/teams/1/captain-transfer', { new_captain_member_id: 5 });
    expect(result.message).toBe('이양 완료');
  });
});

describe('removeMember', () => {
  it('sends DELETE /chinba/teams/:teamId/members/:memberId', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: { message: '추방 완료' } });

    const result = await removeMember(1, 3);

    expect(api.delete).toHaveBeenCalledWith('/chinba/teams/1/members/3');
    expect(result.message).toBe('추방 완료');
  });
});

describe('leaveTeam', () => {
  it('sends DELETE /chinba/teams/:teamId/members/me', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: { message: '탈퇴 완료' } });

    const result = await leaveTeam(1);

    expect(api.delete).toHaveBeenCalledWith('/chinba/teams/1/members/me');
    expect(result.message).toBe('탈퇴 완료');
  });
});

describe('joinTeam', () => {
  it('sends POST /chinba/teams/join with invite_code', async () => {
    const mockResponse = {
      team_id: 1,
      team_name: '테스트팀',
      my_role: 'member',
      message: '가입 완료',
    };
    vi.mocked(api.post).mockResolvedValue({ data: mockResponse });

    const result = await joinTeam({ invite_code: 'abc12345' });

    expect(api.post).toHaveBeenCalledWith('/chinba/teams/join', { invite_code: 'abc12345' });
    expect(result.team_id).toBe(1);
    expect(result.my_role).toBe('member');
  });
});

describe('getInvitations', () => {
  it('sends GET /chinba/teams/:teamId/invitation', async () => {
    const mockInvitation = {
      invite_code: 'abc12345',
      invite_url: 'https://chinba.app/invite/abc12345',
      is_active: true,
      created_at: '2026-03-15',
      expires_at: null,
    };
    vi.mocked(api.get).mockResolvedValue({ data: mockInvitation });

    const result = await getInvitations(1);

    expect(api.get).toHaveBeenCalledWith('/chinba/teams/1/invitations');
    expect(result.invite_code).toBe('abc12345');
    expect(result.is_active).toBe(true);
  });
});

describe('regenerateInviteCode', () => {
  it('sends POST /chinba/teams/:teamId/invitation/regenerate', async () => {
    const mockInvitation = {
      invite_code: 'new12345',
      invite_url: 'https://chinba.app/invite/new12345',
      is_active: true,
      created_at: '2026-03-15',
      expires_at: null,
    };
    vi.mocked(api.post).mockResolvedValue({ data: mockInvitation });

    const result = await regenerateInviteCode(1);

    expect(api.post).toHaveBeenCalledWith('/chinba/teams/1/invitations/regenerate');
    expect(result.invite_code).toBe('new12345');
  });
});
