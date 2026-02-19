'use client';

import { useRouter } from 'next/navigation';
import { useToast } from '@/_context/ToastContext';
import SidebarContent from './SidebarContent';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <div className="md:hidden">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[340px] transform bg-white shadow-xl transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'}`}
      >
        <SidebarContent
          onNavigate={(path) => {
            router.push(path);
            onClose();
          }}
          onShowToast={showToast}
        />
      </div>
    </div>
  );
}
