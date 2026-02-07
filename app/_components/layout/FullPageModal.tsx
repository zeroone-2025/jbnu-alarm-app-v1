'use client';

import { useEffect, ReactNode } from 'react';
import { LuChevronLeft } from 'react-icons/lu';

interface FullPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function FullPageModal({
  isOpen,
  onClose,
  title,
  children,
}: FullPageModalProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 animate-fadeIn bg-gray-50">
      {/* 전체 화면 컨테이너 */}
      <div className="relative mx-auto flex h-full w-full max-w-md flex-col overflow-hidden border-x border-gray-100 bg-white shadow-xl md:max-w-4xl">
        {/* 헤더 */}
        <div className="shrink-0 px-4 pb-3">
          <div className="pt-safe" />
          <div className="relative mt-4 flex items-center justify-center md:mt-4">
            <button
              onClick={onClose}
              className="absolute left-0 z-10 group -ml-1 rounded-full p-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95"
              aria-label="뒤로가기"
            >
              <LuChevronLeft size={24} strokeWidth={2.5} className="transition-transform group-hover:-translate-x-0.5" />
            </button>
            <h1 className="text-base font-bold text-gray-800">{title}</h1>
          </div>
        </div>
        {/* 컨텐츠 영역 */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
