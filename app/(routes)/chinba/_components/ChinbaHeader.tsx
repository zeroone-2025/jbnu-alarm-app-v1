'use client';

import { useRouter } from 'next/navigation';
import { FiMenu, FiChevronLeft } from 'react-icons/fi';

interface ChinbaHeaderProps {
    onMenuClick: () => void;
    showBackButton?: boolean;
}

export function ChinbaHeader({ onMenuClick, showBackButton = false }: ChinbaHeaderProps) {
    const router = useRouter();

    return (
        <div className="shrink-0 px-4 pb-3">
            <div className="pt-safe" />
            <div className="relative mt-4 flex items-center justify-center md:mt-4">
                <button
                    onClick={onMenuClick}
                    className="absolute left-0 z-10 group -ml-1 rounded-full p-2 text-gray-600 transition-all hover:bg-gray-100 active:scale-95"
                    aria-label="메뉴"
                >
                    <FiMenu size={24} />
                </button>
                {showBackButton && (
                    <button
                        onClick={() => router.back()}
                        className="absolute left-9 z-10 rounded-full p-2 text-gray-600 transition-all hover:bg-gray-100 active:scale-95"
                        aria-label="뒤로가기"
                    >
                        <FiChevronLeft size={22} />
                    </button>
                )}
                <button
                    onClick={() => router.push('/chinba')}
                    className="text-base font-bold text-gray-800 hover:text-gray-600 transition-colors"
                >
                    친해지길 바래
                </button>
            </div>
        </div>
    );
}
