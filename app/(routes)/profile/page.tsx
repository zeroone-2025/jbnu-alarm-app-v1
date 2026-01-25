'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FullPageModal from '@/_components/layout/FullPageModal';
import { useUser, useUpdateUser } from '@/_lib/hooks/useUser';
import UserInfoForm, { UserInfoFormData } from '@/_components/auth/UserInfoForm';
import { FiLogOut, FiEdit3 } from 'react-icons/fi';
import { useUserStore } from '@/_lib/store/useUserStore';
import Button from '@/_components/ui/Button';
import Toast from '@/_components/ui/Toast';

export default function ProfilePage() {
    const router = useRouter();
    const { user, isLoggedIn, isAuthLoaded, isLoading: isUserLoading } = useUser();
    const updateMutation = useUpdateUser();
    const clearUser = useUserStore((state) => state.clearUser);
    const [isEditing, setIsEditing] = useState(false);

    // 폼 상태
    const [formData, setFormData] = useState<UserInfoFormData>({
        nickname: '',
        school: '',
        dept_code: '',
        dept_name: '',
        admission_year: '',
    });

    // 토스트 관련 상태
    const [toast, setToast] = useState({
        message: '',
        isVisible: false,
        type: 'success' as 'success' | 'error' | 'info',
        triggerKey: 0,
    });

    // 유저 정보 로드 시 초기값 설정
    useEffect(() => {
        if (user) {
            setFormData({
                nickname: user.nickname || '',
                school: user.school || '',
                dept_code: user.dept_code || '',
                dept_name: '', // 실 서비스 환경에선 user.dept_name이 있을 수 있으나 현재는 필드 없음
                admission_year: user.admission_year ? user.admission_year.toString() : '',
            });
        }
    }, [user]);

    // 비로그인 처리
    useEffect(() => {
        if (isAuthLoaded && !isLoggedIn) {
            router.replace('/');
        }
    }, [isAuthLoaded, isLoggedIn, router]);

    const handleClose = () => {
        router.back();
    };

    const handleFormChange = (data: Partial<UserInfoFormData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                nickname: user.nickname || '',
                school: user.school || '',
                dept_code: user.dept_code || '',
                dept_name: '',
                admission_year: user.admission_year ? user.admission_year.toString() : '',
            });
        }
        setIsEditing(false);
    };

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({
            message,
            type,
            isVisible: true,
            triggerKey: Date.now(),
        });
    };

    const handleLogout = () => {
        if (!confirm('로그아웃 하시겠습니까?')) return;

        // 1. localStorage 정리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('my_subscribed_categories');

        // 2. Zustand Store 정리
        clearUser();

        // 3. 홈으로 이동
        window.location.href = '/?logout=success';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await updateMutation.mutateAsync({
                nickname: formData.nickname,
                school: formData.school,
                dept_code: formData.dept_code,
                admission_year: formData.admission_year ? parseInt(formData.admission_year) : undefined,
            });
            showToast('프로필이 성공적으로 업데이트되었습니다.', 'success');
            setIsEditing(false); // 수정 모드 종료
        } catch (error) {
            console.error('Profile update failed:', error);
            showToast('업데이트 중 오류가 발생했습니다.', 'error');
        }
    };

    if (!isAuthLoaded || isUserLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <FullPageModal
            isOpen={true}
            onClose={handleClose}
            title={isEditing ? "프로필 수정" : "내 프로필"}
        >
            <div className="px-5 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    <UserInfoForm
                        formData={formData}
                        onChange={handleFormChange}
                        showNickname={true}
                        isReadonlyNickname={true}
                        isReadonly={!isEditing}
                    />

                    {/* 모드 전환 버튼 영역 (수정하기 / 취소) */}
                    <div className="flex justify-end mb-4">
                        {!isEditing ? (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all active:scale-95"
                            >
                                <FiEdit3 size={14} />
                                수정하기
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="text-xs font-bold text-gray-500 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
                            >
                                취소
                            </button>
                        )}
                    </div>


                    {/* 저장 버튼 - 수정 모드일 때만 표시 */}
                    {isEditing && (
                        <div className="pt-4 animate-slideUp">
                            <Button
                                type="submit"
                                disabled={updateMutation.isPending}
                                fullWidth
                                size="lg"
                                className="shadow-lg active:scale-95"
                            >
                                {updateMutation.isPending ? '저장 중...' : '저장하기'}
                            </Button>
                        </div>
                    )}

                    {/* 로그아웃 버튼 */}
                    <div className="pt-10 pb-6 border-t border-gray-100 flex justify-center">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-red-500"
                        >
                            <FiLogOut size={16} />
                            계정 로그아웃
                        </button>
                    </div>
                </form>
            </div>

            {/* 토스트 알림 */}
            <Toast
                message={toast.message}
                isVisible={toast.isVisible}
                type={toast.type}
                triggerKey={toast.triggerKey}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </FullPageModal>
    );
}
