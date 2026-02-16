'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FiUser, FiSettings, FiBell, FiUsers, FiLogOut, FiHome, FiInstagram, FiMail } from 'react-icons/fi';
import { IconType } from 'react-icons';
import { useUser } from '@/_lib/hooks/useUser';
import { getAllDepartments, logoutUser } from '@/_lib/api';
import { useUserStore } from '@/_lib/store/useUserStore';
import LoginButtonGroup from '@/_components/auth/LoginButtonGroup';
import { useMyChinbaEvents } from '@/_lib/hooks/useChinba';
import { ChinbaEventList } from '@/(main)/chinba/_components/ChinbaEventList';
import LoadingSpinner from '@/_components/ui/LoadingSpinner';

interface SidebarContentProps {
  onNavigate: (path: string) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface ServiceItem {
  id: string;
  label: string;
  icon: IconType;
  href?: string;
  isDisabled?: boolean;
  matchPath?: string;
}

const SERVICE_ITEMS: ServiceItem[] = [
  { id: 'profile', label: '프로필', icon: FiUser, href: '/profile', matchPath: '/profile' },
  { id: 'jbnu-alarm', label: '전북대 알리미', icon: FiBell, matchPath: '/' },
  { id: 'chinba', label: '친해지길 바래', icon: FiUsers, matchPath: '/chinba' },
  // { id: 'flow', label: '플로우', icon: FiZap, isDisabled: true },
];

function formatAdmissionYear(year: number | null | undefined): string | null {
  if (!year) return null;
  return `${String(year).slice(-2)}학번`;
}

export default function SidebarContent({ onNavigate, onShowToast }: SidebarContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, isAuthLoaded, isLoading } = useUser();
  const clearUser = useUserStore((state) => state.clearUser);
  const [chinbaExpanded, setChinbaExpanded] = useState(false);
  const { data: chinbaEvents, isLoading: isLoadingChinbaEvents, refetch } = useMyChinbaEvents(isLoggedIn);

  useEffect(() => {
    localStorage.setItem('sidebar_chinba_expanded', String(chinbaExpanded));
  }, [chinbaExpanded]);

  const handleAdminClick = () => {
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://dev-office.zerotime.kr';
    window.location.href = `${adminUrl}/dashboard`;
  };

  const isItemActive = (item: ServiceItem) => {
    if (!item.matchPath) return false;
    if (item.matchPath === '/') return pathname === '/';
    return pathname.startsWith(item.matchPath);
  };

  const handleServiceClick = (item: ServiceItem) => {
    if (item.isDisabled) {
      onShowToast('준비 중입니다', 'info');
      return;
    }

    if (item.id === 'chinba') {
      onNavigate('/chinba');
      return;
    }

    if (item.id === 'jbnu-alarm') {
      onNavigate('/');
      return;
    }

    if (item.href) {
      onNavigate(item.href);
      return;
    }

    if (item.matchPath && isItemActive(item)) {
      // Already on page, do nothing (caller closes sidebar)
      return;
    }
  };

  const handleChinbaToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      onShowToast('로그인이 필요합니다', 'info');
      return;
    }
    setChinbaExpanded(prev => !prev);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const admissionYearText = formatAdmissionYear(user?.admission_year);

  const [deptName, setDeptName] = useState<string | null>(null);
  useEffect(() => {
    if (!user?.dept_code) {
      setDeptName(null);
      return;
    }
    getAllDepartments(true).then((depts) => {
      const found = depts.find((d) => d.dept_code === user.dept_code);
      setDeptName(found?.dept_name || null);
    }).catch(() => setDeptName(null));
  }, [user?.dept_code]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Profile Card */}
      <div className="pt-safe px-5 pb-4 md:pt-0">
        <div className="pt-8">
          {!isAuthLoaded || (isLoading && !user) ? (
            <div className="flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-3 bg-gray-200 rounded w-32" />
              </div>
            </div>
          ) : !isLoggedIn ? (
            <>
              <p className="px-1 mb-4 text-sm font-medium text-gray-700">
                로그인하여 설정을 저장하고
                <br />
                더 많은 기능을 이용해보세요.
              </p>
              <LoginButtonGroup onLoginStart={() => { }} />
            </>
          ) : (
            <div className="flex items-center gap-4">
              {user?.profile_image ? (
                <img
                  src={user.profile_image}
                  alt={user.nickname || '사용자'}
                  className="object-cover w-16 h-16 rounded-full border border-gray-100"
                />
              ) : (
                <div className="flex items-center justify-center w-16 h-16 text-gray-400 bg-gray-50 rounded-full border border-gray-100">
                  <FiUser size={28} />
                </div>
              )}
              <div className="flex flex-col">
                <p className="text-base font-bold text-gray-800">
                  {user?.nickname || '사용자'}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {user?.email}
                </p>
                {(user?.school || deptName || admissionYearText) && (
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {[user?.school, deptName, admissionYearText].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Service List */}
      <div className="px-3 pt-4">
        {SERVICE_ITEMS.map((item) => {
          if (!isLoggedIn && item.id === 'profile') {
            return null;
          }

          const Icon = item.icon;
          return (
            <div key={item.id}>
              <button
                onClick={() => handleServiceClick(item)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${isItemActive(item)
                  ? 'bg-blue-50 text-blue-700'
                  : item.isDisabled
                    ? 'text-gray-400'
                    : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                  }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
                {isItemActive(item) && (
                  <span className="ml-auto text-[10px] font-medium text-blue-500 bg-blue-100 px-1.5 py-0.5 rounded">
                    현재
                  </span>
                )}
              </button>

              {item.id === 'chinba' && chinbaExpanded && (
                <div className="mt-2 ml-6 mr-1 mb-3 space-y-2 max-h-[300px] overflow-y-auto rounded-lg">
                  <ChinbaEventList
                    events={chinbaEvents}
                    isLoading={isLoadingChinbaEvents}
                    onEventClick={(eventId) => {
                      onNavigate(`/chinba/event?id=${eventId}`);
                    }}
                    onDeleteSuccess={refetch}
                    onShowToast={onShowToast}
                    compact
                    emptyMessage="참여한 방이 없습니다"
                  />
                </div>
              )}
            </div>
          );
        })}
        {isAdmin && (
          <button
            onClick={handleAdminClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-purple-600 hover:bg-purple-50 active:bg-purple-100"
          >
            <FiSettings size={18} />
            <span className="text-sm font-medium">관리자 페이지</span>
          </button>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Logout */}
      {isLoggedIn && (
        <div className="px-5 pb-3">
          <button
            onClick={async () => {
              if (!confirm('로그아웃 하시겠습니까?')) return;
              await logoutUser();
              localStorage.removeItem('my_subscribed_categories');
              localStorage.removeItem('access_token');
              clearUser();
              window.location.href = '/?logout=success';
            }}
            className="flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-red-500"
          >
            <FiLogOut size={16} />
            로그아웃
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="p-5 border-t border-gray-100 bg-gray-50/30">

        <div className="flex flex-col gap-4 text-center">

          <p className="text-[11px] leading-relaxed text-gray-400 break-keep">
            이 프로젝트는 전북대학교
            <br />
            컴퓨터인공지능학부, 경영학과 학생들이 협력하여
            <br />
            개발 중인 베타 서비스입니다.
          </p>




          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold text-gray-400 tracking-wide">
              Powered by <span className="text-[#034286]">JEduTools</span>
            </p>
          </div>
          {/* Social Links */}
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://home.zerotime.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
              aria-label="Landing Page"
            >
              <FiHome size={18} />
            </a>
            <a
              href="https://www.instagram.com/zerotime_official/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
              aria-label="Instagram"
            >
              <FiInstagram size={18} />
            </a>
            <a
              href="mailto:zeroone012025@gmail.com"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
              aria-label="Email"
            >
              <FiMail size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
