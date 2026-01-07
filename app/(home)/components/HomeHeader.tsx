import { FiUser, FiBell } from 'react-icons/fi';

interface HomeHeaderProps {
  // 알림 버튼 클릭 핸들러 (추후 구현)
  onNotificationClick?: () => void;
  // 메뉴 버튼 클릭 핸들러
  onMenuClick: () => void;
}

export default function HomeHeader({ onNotificationClick, onMenuClick }: HomeHeaderProps) {
  return (
    <header className="relative flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-5">
      {/* Left: User Icon (Menu) */}
      <div className="flex w-20 justify-start">
        <button
          onClick={onMenuClick}
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

      {/* Right: Notification */}
      <div className="flex w-20 items-center justify-end">
        <button
          onClick={onNotificationClick}
          className="rounded-full p-2 text-gray-600 transition-all hover:bg-gray-100"
          aria-label="알림"
        >
          <FiBell size={24} />
        </button>
      </div>
    </header>
  );
}
