'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiSettings } from 'react-icons/fi';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: '홈',
      icon: FiHome,
    },
    {
      href: '/settings',
      label: '설정',
      icon: FiSettings,
    },
  ];

  return (
    <nav className="shrink-0 border-t border-gray-100 bg-white">
      {/* 반응형 컨테이너 */}
      <div className="mx-auto w-full max-w-md md:max-w-4xl">
        <div className="grid grid-cols-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-3 transition-colors ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={24} />
                <span className="mt-1 text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
