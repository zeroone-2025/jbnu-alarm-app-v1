'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  type?: 'success' | 'error' | 'info';
}

export default function Toast({ message, isVisible, onClose, duration = 3000, type = 'info' }: ToastProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    } else {
      // 애니메이션 시간을 고려하여 언마운트 지연
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // duration-300과 일치
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!shouldRender) return null;

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gray-700';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-gray-900';
    }
  };

  return (
    <div className={`fixed bottom-28 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <div className={`rounded-lg px-4 py-3 text-sm text-white shadow-lg ${getBgColor()}`}>
        {message}
      </div>
    </div>
  );
}
