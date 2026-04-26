'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiBriefcase, FiHome, FiUser } from 'react-icons/fi';

const tabs = [
  { href: '/flow', label: '홈', icon: FiHome, exact: true },
  { href: '/flow/career', label: '내 이력', icon: FiUser, exact: false },
  { href: '/flow/companies', label: '기업', icon: FiBriefcase, exact: false },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const normalized = pathname.replace(/\/$/, '') || '/';
  const isActive = (href: string, exact: boolean) =>
    exact ? normalized === href : normalized.startsWith(href);

  return (
    <div className="shrink-0 flex items-center border-t border-gray-100 bg-white pb-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.href, tab.exact);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors ${
              active ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
            <span className={`text-[11px] ${active ? 'font-bold' : 'font-medium'}`}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
