'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiChevronRight, FiSettings, FiBell, FiUsers, FiZap } from 'react-icons/fi';
import { IconType } from 'react-icons';
import { useUser } from '@/_lib/hooks/useUser';
import { getAllDepartments } from '@/_lib/api';
import LoginButtonGroup from '@/_components/auth/LoginButtonGroup';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface ServiceItem {
  id: string;
  label: string;
  icon: IconType;
  href?: string;
  isActive?: boolean;
  isDisabled?: boolean;
}

const SERVICE_ITEMS: ServiceItem[] = [
  { id: 'profile', label: '프로필', icon: FiUser, href: '/profile' },
  { id: 'jbnu-alarm', label: '전북대 알리미', icon: FiBell, isActive: true },
  { id: 'chinba', label: '친해지길 바래', icon: FiUsers, href: '/chinba' },
  { id: 'flow', label: '플로우', icon: FiZap, isDisabled: true },
];

function formatAdmissionYear(year: number | null | undefined): string | null {
  if (!year) return null;
  return `${String(year).slice(-2)}학번`;
}

export default function Sidebar({ isOpen, onClose, onShowToast }: SidebarProps) {
  const router = useRouter();
  const { user, isLoggedIn, isAuthLoaded, isLoading } = useUser();

  const handleAdminClick = () => {
    onClose();
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001';
    window.location.href = `${adminUrl}/dashboard`;
  };

  const handleServiceClick = (item: ServiceItem) => {
    if (item.isDisabled) {
      onShowToast('준비 중입니다', 'info');
      return;
    }
    if (item.href) {
      router.push(item.href);
      onClose();
      return;
    }
    if (item.isActive) {
      onClose();
      return;
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const admissionYearText = formatAdmissionYear(user?.admission_year);

  // dept_code → dept_name 변환
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
    <>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 z-40 bg-black/50 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`absolute inset-y-0 left-0 z-50 w-[340px] transform bg-white shadow-xl transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Profile Card */}
          <div className="pt-safe px-5 pb-4">
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
                  <LoginButtonGroup onLoginStart={onClose} />
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
              // 비로그인 시 프로필 항목 숨기기
              if (!isLoggedIn && item.id === 'profile') {
                return null;
              }
              
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleServiceClick(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${item.isActive
                    ? 'bg-blue-50 text-blue-700'
                    : item.isDisabled
                      ? 'text-gray-400'
                      : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                    }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.isActive && (
                    <span className="ml-auto text-[10px] font-medium text-blue-500 bg-blue-100 px-1.5 py-0.5 rounded">
                      현재
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Admin Button */}
          {isAdmin && (
            <div className="px-5 pb-3">
              <button
                onClick={handleAdminClick}
                className="w-full p-4 text-left transition-all border border-purple-100 bg-purple-50/50 rounded-xl hover:bg-purple-100 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 text-purple-600 bg-purple-100 rounded-full">
                      <FiSettings size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        관리자 페이지
                      </p>
                      <p className="text-[11px] text-purple-600">Admin Dashboard</p>
                    </div>
                  </div>
                  <FiChevronRight className="text-purple-400" size={18} />
                </div>
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
