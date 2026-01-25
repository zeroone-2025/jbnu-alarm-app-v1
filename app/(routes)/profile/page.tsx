'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FullPageModal from '@/_components/layout/FullPageModal';
import { useUser, useUpdateUser } from '@/_lib/hooks/useUser';
import { FiUser, FiHome, FiBook, FiHash, FiLogOut } from 'react-icons/fi';
import { useUserStore } from '@/_lib/store/useUserStore';

export default function ProfilePage() {
    const router = useRouter();
    const { user, isLoggedIn, isAuthLoaded, isLoading: isUserLoading } = useUser();
    const updateMutation = useUpdateUser();
    const clearUser = useUserStore((state) => state.clearUser);

    // 폼 상태
    const [formData, setFormData] = useState({
        nickname: '',
        school: '',
        dept_code: '',
        admission_year: '',
    });

    // 유저 정보 로드 시 초기값 설정
    useEffect(() => {
        if (user) {
            setFormData({
                nickname: user.nickname || '',
                school: user.school || '',
                dept_code: user.dept_code || '',
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
            alert('프로필이 성공적으로 업데이트되었습니다.');
            router.back();
        } catch (error) {
            console.error('Profile update failed:', error);
            alert('업데이트 중 오류가 발생했습니다.');
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
        <FullPageModal isOpen={true} onClose={handleClose} title="프로필 수정">
            <div className="px-5 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 닉네임 */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FiUser className="text-blue-500" />
                            닉네임
                        </label>
                        <input
                            type="text"
                            name="nickname"
                            value={formData.nickname}
                            onChange={handleInputChange}
                            placeholder="닉네임을 입력하세요"
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:bg-white"
                        />
                    </div>

                    {/* 학교 */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FiHome className="text-blue-500" />
                            학교
                        </label>
                        <input
                            type="text"
                            name="school"
                            value={formData.school}
                            onChange={handleInputChange}
                            placeholder="학교명을 입력하세요"
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:bg-white"
                        />
                    </div>

                    {/* 학과 */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FiBook className="text-blue-500" />
                            학과
                        </label>
                        <input
                            type="text"
                            name="dept_code"
                            value={formData.dept_code}
                            onChange={handleInputChange}
                            placeholder="학과 코드를 입력하세요 (예: dept_csai)"
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:bg-white"
                        />
                        <p className="text-xs text-gray-400 pl-1">※ 현재는 학과 코드를 직접 입력해주세요. (예: dept_csai)</p>
                    </div>

                    {/* 학번 */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FiHash className="text-blue-500" />
                            학번 (입학년도)
                        </label>
                        <input
                            type="number"
                            name="admission_year"
                            value={formData.admission_year}
                            onChange={handleInputChange}
                            placeholder="학번 2자리를 입력하세요 (예: 25)"
                            min="0"
                            max="99"
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:bg-white"
                        />
                    </div>

                    {/* 저장 버튼 */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg transition-all active:scale-95 disabled:bg-gray-400"
                        >
                            {updateMutation.isPending ? '저장 중...' : '저장하기'}
                        </button>
                    </div>

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
        </FullPageModal>
    );
}
