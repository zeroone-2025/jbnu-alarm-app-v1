'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, updateUserProfile, checkHasToken } from '@/_lib/api';
import { useUserStore } from '@/_lib/store/useUserStore';
import type { UserProfileUpdate } from '@/_types/user';
import { useEffect, useState } from 'react';
import { useAuthInitialized } from '@/providers';

/**
 * 유저 프로필 조회 및 관리 훅
 * - React Query로 서버 데이터를 가져오고 Zustand Store와 동기화
 */
export function useUser() {
    const user = useUserStore((state) => state.user);
    const setUser = useUserStore((state) => state.setUser);
    const [isInternalLoaded, setIsInternalLoaded] = useState(false);
    const isAuthInitialized = useAuthInitialized();

    // 인증 초기화 완료 후 메모리의 토큰 확인
    const hasToken = isAuthInitialized && checkHasToken();

    const query = useQuery({
        queryKey: ['user', 'profile'],
        queryFn: getUserProfile,
        staleTime: 1000 * 60 * 5, // 5분
        enabled: hasToken,
        retry: 1,
    });

    // 조회 성공 시 Zustand Store 업데이트 / 실패 시 초기화
    useEffect(() => {
        if (query.data) {
            setUser(query.data);
            setIsInternalLoaded(true);
        } else if (query.isError) {
            setUser(null);
            setIsInternalLoaded(true);
        } else if (isAuthInitialized && !hasToken) {
            // 인증 초기화 완료 + 토큰 없음 = 비로그인 상태
            setUser(null);
            setIsInternalLoaded(true);
        }
    }, [query.data, query.isError, hasToken, isAuthInitialized, setUser]);

    return {
        ...query,
        user,
        isLoggedIn: !!user,
        isAuthLoaded: isAuthInitialized && isInternalLoaded && !query.isFetching,
    };
}

/**
 * 유저 프로필 수정 훅
 * - 수정 성공 시 캐시 무효화 및 Zustand Store 업데이트
 */
export function useUpdateUser() {
    const queryClient = useQueryClient();
    const setUser = useUserStore((state) => state.setUser);

    return useMutation({
        mutationFn: (data: UserProfileUpdate) => updateUserProfile(data),
        onSuccess: (updatedUser) => {
            // 1. React Query 캐시 업데이트
            queryClient.setQueryData(['user', 'profile'], updatedUser);
            // 2. Zustand Store 업데이트
            setUser(updatedUser);
            // 3. 관련 쿼리 무효화 (필요시)
            // queryClient.invalidateQueries({ queryKey: ['user'] });
        },
    });
}
