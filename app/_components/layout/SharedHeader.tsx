'use client';

import { useRouter } from 'next/navigation';
import { FiUser, FiBell } from 'react-icons/fi';
import Logo from '@/_components/ui/Logo';
import { useNotificationBadge } from '@/_context/NotificationBadgeContext';
import { useUserStore } from '@/_lib/store/useUserStore';

interface SharedHeaderProps {
  title: string; // 'logo' | '프로필' | '친해지길 바래'
  onMenuClick: () => void;
}

export default function SharedHeader({ title, onMenuClick }: SharedHeaderProps) {
  const router = useRouter();
  const { newKeywordCount, markKeywordNoticesSeen, keywordNotices } = useNotificationBadge();
  const user = useUserStore((state) => state.user);

  const handleNotificationClick = () => {
    const lastSeen = user?.keyword_notice_seen_at ?? null;
    markKeywordNoticesSeen(keywordNotices);
    router.push(lastSeen ? `/notifications?last_seen=${encodeURIComponent(lastSeen)}` : '/notifications');
  };

  return (
    <header className="relative flex min-h-[calc(4rem+var(--safe-area-top))] shrink-0 items-end justify-between bg-white px-5 pb-5 pt-safe">
      {/* Left: Menu button (hidden on desktop where sidebar is always visible) */}
      <div className="flex w-20 justify-start">
        <button
          onClick={onMenuClick}
          className="rounded-full p-2 text-gray-600 transition-all hover:bg-gray-100 md:hidden"
          aria-label="메뉴 열기"
        >
          <FiUser size={19} />
        </button>
      </div>

      {/* Center: Logo or title */}
      <div className="absolute left-1/2 -translate-x-1/2 transform">
        {title === 'logo' ? (
          <button
            type="button"
            aria-label="맨 위로 이동 및 새로고침"
            className="appearance-none bg-transparent border-none p-0 m-0 leading-none cursor-pointer flex items-center"
            onClick={() => window.dispatchEvent(new CustomEvent('logo-tap'))}
          >
            <Logo className="h-7 w-auto text-gray-900" />
          </button>
        ) : (
          <h1 className="text-base font-bold text-gray-800 whitespace-nowrap">{title}</h1>
        )}
      </div>

      {/* Right: Notification bell */}
      <div className="flex w-20 items-center justify-end">
        <button
          onClick={handleNotificationClick}
          className="relative rounded-full p-2 text-gray-600 transition-all hover:bg-gray-100"
          aria-label="알림"
        >
          <FiBell size={19} />
          {newKeywordCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
              {newKeywordCount > 99 ? '99+' : newKeywordCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
