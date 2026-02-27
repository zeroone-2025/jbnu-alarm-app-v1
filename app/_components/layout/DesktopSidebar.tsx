'use client';

import { usePathname } from 'next/navigation';
import { useToast } from '@/_context/ToastContext';
import SidebarContent from './SidebarContent';
import { useRouter } from 'next/navigation';
import { FiUser, FiBell, FiUsers, FiSettings, FiChevronsRight } from 'react-icons/fi';
import { useUser } from '@/_lib/hooks/useUser';

interface DesktopSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface CollapsedNavItem {
  id: string;
  icon: typeof FiBell;
  href: string;
  label: string;
  matchPath: string;
}

const NAV_ITEMS: CollapsedNavItem[] = [
  { id: 'jbnu-alarm', icon: FiBell, href: '/', label: '전북대 알리미', matchPath: '/' },
  { id: 'chinba', icon: FiUsers, href: '/chinba', label: '친해지길 바래', matchPath: '/chinba' },
];

export default function DesktopSidebar({ collapsed, onToggle }: DesktopSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const { user, isLoggedIn } = useUser();

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const isActive = (matchPath: string) => {
    if (matchPath === '/') return pathname === '/';
    return pathname.startsWith(matchPath);
  };

  if (collapsed) {
    return (
      <aside className="hidden md:flex md:w-[60px] md:shrink-0 h-full border-r border-gray-100 bg-white overflow-hidden transition-all duration-300 flex-col items-center py-4 gap-1">
        {/* Expand toggle */}
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors mb-4"
          title="사이드바 펼치기"
        >
          <FiChevronsRight size={20} />
        </button>

        {/* Profile icon */}
        {isLoggedIn && (
          <button
            onClick={() => router.push('/profile')}
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
              isActive('/profile')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
            title="프로필"
          >
            {user?.profile_image ? (
              <img
                src={user.profile_image}
                alt={user.nickname || '사용자'}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <FiUser size={20} />
            )}
          </button>
        )}

        {/* Nav icons */}
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                isActive(item.matchPath)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              title={item.label}
            >
              <Icon size={20} />
            </button>
          );
        })}

        {/* Admin icon */}
        {isAdmin && (
          <button
            onClick={() => {
              const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://dev-office.zerotime.kr';
              window.location.href = `${adminUrl}/dashboard`;
            }}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-purple-500 hover:bg-purple-50 transition-colors"
            title="관리자 페이지"
          >
            <FiSettings size={20} />
          </button>
        )}
      </aside>
    );
  }

  return (
    <aside className="hidden md:flex md:w-[260px] md:shrink-0 h-full border-r border-gray-100 bg-white overflow-y-auto overflow-x-hidden transition-all duration-300">
      <SidebarContent
        onNavigate={(path) => router.push(path)}
        onShowToast={showToast}
        onCollapse={onToggle}
      />
    </aside>
  );
}
