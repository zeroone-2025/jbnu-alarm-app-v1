// 사용자 관련 타입 정의

export interface UserProfile {
    id: number;
    email: string;
    username: string | null;
    nickname: string | null;
    dept_code: string | null;
    school: string;
    admission_year: number | null;
    profile_image: string | null;
    role: string; // "user" | "admin" | "super_admin"
    user_type: 'student' | 'mentor';
    created_at: string;
}

// 사용자 정보 업데이트 요청
export interface UserProfileUpdate {
    nickname?: string;
    school?: string;
    dept_code?: string;
    admission_year?: number;
    fcm_token?: string;
    profile_image?: string;
}

// 온보딩 완료 요청
export interface OnboardingRequest {
    user_type: 'student' | 'mentor';
    school: string;
    dept_code?: string;
    admission_year?: number;
    board_codes: string[];
}

// 사용자 구독 정보
export interface UserSubscription {
    id: number;
    board_code: string;
}

// 구독 업데이트 응답
export interface UpdateSubscriptionsResponse {
    message: string;
    subscriptions: UserSubscription[];
}
