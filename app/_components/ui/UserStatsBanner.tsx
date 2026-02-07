'use client';

import { useUserStats } from '@/_lib/hooks/useUserStats';
import { FiUsers } from 'react-icons/fi';

interface UserStatsBannerProps {
    isLoggedIn: boolean;
    onSignupClick?: () => void;
}

export default function UserStatsBanner({ isLoggedIn, onSignupClick }: UserStatsBannerProps) {
    const { data: stats, isLoading } = useUserStats();

    if (isLoading || !stats) return null;

    const formattedCount = stats.total_users.toLocaleString('ko-KR');

    if (!isLoggedIn) {
        return (
            <button
                onClick={onSignupClick}
                className="mx-4 mt-3 mb-1 px-4 py-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-left w-[calc(100%-2rem)] animate-slideDown"
            >
                <div className="flex items-start gap-3">
                    <FiUsers size={20} className="text-blue-600 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm text-gray-700">
                            벌써 <span className="font-bold text-blue-600">{formattedCount}명</span>의 전북대 학생이 제로타임을 쓰고 있어요
                        </p>
                        <p className="text-xs font-semibold text-blue-600 mt-1.5">
                            나만 놓치고 있을 수도? →
                        </p>
                    </div>
                </div>
            </button>
        );
    }

    return (
        <div className="mx-4 mt-3 mb-1 px-4 py-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 animate-slideDown">
            <div className="flex items-start gap-3">
                <FiUsers size={20} className="text-blue-600 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700">
                    제로타임은 <span className="font-bold text-blue-600">{formattedCount}명</span>의 전북대 학생과 함께하고 있어요
                </p>
            </div>
        </div>
    );
}
