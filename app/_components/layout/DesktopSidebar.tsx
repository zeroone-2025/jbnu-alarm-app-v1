'use client';

import { useToast } from '@/_context/ToastContext';
import SidebarContent from './SidebarContent';
import { useRouter } from 'next/navigation';

export default function DesktopSidebar() {
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <aside className="hidden md:flex md:w-[320px] md:shrink-0 h-full border-r border-gray-100 bg-white overflow-y-auto">
      <SidebarContent
        onNavigate={(path) => router.push(path)}
        onShowToast={showToast}
      />
    </aside>
  );
}
