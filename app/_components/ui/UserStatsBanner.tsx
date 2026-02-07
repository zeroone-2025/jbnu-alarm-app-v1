'use client';

import { useUserStats } from '@/_lib/hooks/useUserStats';
import { FiUsers } from 'react-icons/fi';

export default function UserStatsBanner() {
    const { data: stats, isLoading } = useUserStats();

    if (isLoading || !stats) return null;

    const formattedCount = stats.total_users.toLocaleString('ko-KR');

    return (
        <div className="animate-slideDown bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border-b border-blue-100/50">
            <div className="flex items-center justify-center px-4 py-3 max-w-md mx-auto md:max-w-4xl">
                <div className="flex items-center gap-2">
                    <FiUsers size={16} className="text-blue-600" />
                    <span className="text-xs text-gray-700">
                        <span className="font-bold text-blue-600">{formattedCount}명</span>의 전북대 학생이 제로타임을 이용하고 있어요
                    </span>
                </div>
            </div>
        </div>
    );
}
