import { FiUser, FiBell } from 'react-icons/fi';

interface HomeHeaderProps {
  // 알림 버튼 클릭 핸들러 (추후 구현)
  onNotificationClick?: () => void;
  notificationCount?: number;
  // 메뉴 버튼 클릭 핸들러
  onMenuClick: () => void;
}

import Logo from '@/_components/ui/Logo';

export default function HomeHeader({ onNotificationClick, notificationCount = 0, onMenuClick }: HomeHeaderProps) {
  return (
    <header className="relative flex min-h-[calc(4rem+var(--safe-area-top))] shrink-0 items-end justify-between border-b border-gray-100 bg-white px-5 pb-4 pt-safe">
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
          {notificationCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
