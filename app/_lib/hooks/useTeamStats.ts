import { useQuery } from '@tanstack/react-query';
import { getTeamStats } from '@/_lib/api/stats';

export function useTeamStats() {
    return useQuery({
        queryKey: ['stats', 'teams'],
        queryFn: getTeamStats,
        staleTime: 1000 * 60 * 60, // 1시간 캐시
        refetchOnMount: false,
    });
}
