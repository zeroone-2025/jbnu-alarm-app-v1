import { FiUser, FiBell } from 'react-icons/fi';

interface HomeHeaderProps {
  // 알림 버튼 클릭 핸들러 (추후 구현)
  onNotificationClick?: () => void;
  showNotificationBadge?: boolean;
  // 메뉴 버튼 클릭 핸들러
  onMenuClick: () => void;
}

import Logo from '@/_components/ui/Logo';

export default function HomeHeader({ onNotificationClick, showNotificationBadge, onMenuClick }: HomeHeaderProps) {
  return (
    <header className="relative flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-5">
      {/* Left: User Icon (Menu) */}
      <div className="flex w-20 justify-start">
        <button
          onClick={onMenuClick}
          className="rounded-full p-2 text-gray-600 transition-all hover:bg-gray-100"
          aria-label="메뉴 열기"
        >
          <FiUser size={19} />
        </button>
      </div>

      {/* Center: Logo */}
      <div className="absolute left-1/2 -translate-x-1/2 transform">
        <Logo className="h-7 w-auto text-gray-900" />
      </div>

      {/* Right: Notification */}
      <div className="flex w-20 items-center justify-end">
        <button
          onClick={onNotificationClick}
          className="relative rounded-full p-2 text-gray-600 transition-all hover:bg-gray-100"
          aria-label="알림"
        >
          <FiBell size={19} />
          {showNotificationBadge && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          )}
        </button>
      </div>
    </header>
  );
}
