import api from './client';

export interface BoardGroup {
  id: number;
  name: string;
  board_codes: string[];
  created_at: string;
  updated_at: string;
}

interface BoardGroupCachePayload {
  groups: BoardGroup[];
  cached_at: number;
}

const BOARD_GROUP_CACHE_PREFIX = 'JB_ALARM_BOARD_GROUPS_CACHE_V1';

export const getBoardGroupsCacheKey = (email: string) =>
  `${BOARD_GROUP_CACHE_PREFIX}:${email}`;

export const readBoardGroupsCache = (email: string): BoardGroup[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getBoardGroupsCacheKey(email));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BoardGroupCachePayload;
    return Array.isArray(parsed?.groups) ? parsed.groups : [];
  } catch {
    return [];
  }
};

export const writeBoardGroupsCache = (email: string, groups: BoardGroup[]) => {
  if (typeof window === 'undefined') return;
  const payload: BoardGroupCachePayload = {
    groups,
    cached_at: Date.now(),
  };
  localStorage.setItem(getBoardGroupsCacheKey(email), JSON.stringify(payload));
};

interface UpsertBoardGroupPayload {
  name: string;
  board_codes: string[];
}

export const getMyBoardGroups = async () => {
  const response = await api.get<BoardGroup[]>('/users/me/board-groups');
  return response.data;
};

export const upsertMyBoardGroup = async (payload: UpsertBoardGroupPayload) => {
  const response = await api.post<BoardGroup>('/users/me/board-groups', payload);
  return response.data;
};

export const deleteMyBoardGroup = async (groupId: number) => {
  const response = await api.delete<{ message: string; group_id: number }>(`/users/me/board-groups/${groupId}`);
  return response.data;
};
