'use client';

import { useEffect, ReactNode } from 'react';
import { FiArrowLeft } from 'react-icons/fi';

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
        <div className="shrink-0 border-b border-gray-100 px-4 pb-3">
          <div className="pt-safe" />
          <div className="mt-4 flex items-center gap-2 md:mt-4">
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-600 transition-all hover:bg-gray-100"
              aria-label="뒤로가기"
            >
              <FiArrowLeft size={20} />
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
