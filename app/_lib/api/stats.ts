import api from './client';

export interface UserStats {
    total_users: number;
    school: string;
    updated_at: string;
}

export const getUserStats = async () => {
    const response = await api.get<UserStats>('/stats/users');
    return response.data;
};
