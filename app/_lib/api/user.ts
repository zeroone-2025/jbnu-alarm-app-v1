import api from './client';
import type {
    UserProfile,
    UserProfileUpdate,
    UserSubscription,
    UpdateSubscriptionsResponse,
    OnboardingRequest, // 추가
} from '@/_types/user';

// 내 정보 조회
export const getUserProfile = async () => {
    const response = await api.get<UserProfile>('/users/me');
    return response.data;
};

// 사용자 정보 업데이트
export const updateUserProfile = async (data: UserProfileUpdate) => {
    const response = await api.patch<UserProfile>('/users/me', data);
    return response.data;
};

// 내 구독 조회
export const getUserSubscriptions = async () => {
    const response = await api.get<UserSubscription[]>('/users/me/subscriptions');
    return response.data;
};

// 구독 업데이트 (전체 교체)
export const updateUserSubscriptions = async (boardCodes: string[]) => {
    const response = await api.put<UpdateSubscriptionsResponse>('/users/me/subscriptions', {
        board_codes: boardCodes,
    });
    return response.data;
};

// 온보딩 완료 처리
export const completeOnboarding = async (data: OnboardingRequest) => {
    const response = await api.post<{ message: string; user: UserProfile; subscribed_boards: string[] }>(
        '/users/me/onboarding',
        data
    );
    return response.data;
};
