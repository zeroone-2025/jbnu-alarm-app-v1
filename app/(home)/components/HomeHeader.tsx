import { useState } from 'react';
import { FiRefreshCw, FiEye, FiEyeOff, FiUser } from 'react-icons/fi';
import Sidebar from '@/components/Sidebar';

interface HomeHeaderProps {
  includeRead: boolean;
  refreshing: boolean;
  onToggleIncludeRead: () => void;
  onRefresh: () => void;
}

export default function HomeHeader({
  includeRead,
  refreshing,
  onToggleIncludeRead,
  onRefresh,
}: HomeHeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className="relative flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-5">
        {/* Left: User Icon (Menu) */}
        <div className="flex w-20 justify-start">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-full p-2 text-gray-600 transition-all hover:bg-gray-100"
            aria-label="메뉴 열기"
          >
            <FiUser size={24} />
          </button>
        </div>

        {/* Center: Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 transform">
          <h1 className="text-xl font-bold text-gray-800">ZeroTime</h1>
        </div>

        {/* Right: Actions */}
        <div className="flex w-20 justify-end items-center gap-1">
          {/* 읽음 필터 버튼 */}
          <button
            onClick={onToggleIncludeRead}
            className={`rounded-full p-2 transition-all hover:bg-gray-100 ${
              includeRead ? 'text-blue-500' : 'text-gray-600'
            }`}
            aria-label={includeRead ? '읽은 공지 포함 중' : '안 읽은 공지만 보기'}
            title={includeRead ? '읽은 공지도 함께 보는 중' : '안 읽은 공지만 보는 중'}
          >
            {includeRead ? <FiEye size={20} /> : <FiEyeOff size={20} />}
          </button>

          {/* 새로고침 버튼 */}
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className={`rounded-full p-2 transition-all hover:bg-gray-100 ${
              refreshing ? 'animate-spin text-blue-500' : 'text-gray-600'
            }`}
            aria-label="새로고침"
          >
            <FiRefreshCw size={20} />
          </button>
        </div>
      </header>

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
