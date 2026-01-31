'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  type?: 'success' | 'error' | 'info';
  triggerKey?: number;
}

export default function Toast({ message, isVisible, onClose, duration = 3000, type = 'info', triggerKey }: ToastProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const lastTriggerKeyRef = useRef<number | undefined>(undefined);
  const hasHadToastsRef = useRef(false);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // 안정적인 onClose 콜백
  const stableOnClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isVisible || !message) return;

    // triggerKey가 같으면 무시 (중복 방지)
    if (triggerKey !== undefined && triggerKey === lastTriggerKeyRef.current) {
      return;
    }
    lastTriggerKeyRef.current = triggerKey;

    const id = `${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, message, type };

    // 새 toast를 맨 앞에 추가 (최대 5개 제한)
    setToasts(prev => [newToast, ...prev].slice(0, 5));

    // duration 후에 자동으로 제거 (타이머를 Map에 저장)
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      timersRef.current.delete(id);
    }, duration);

    timersRef.current.set(id, timer);
  }, [isVisible, message, type, duration, triggerKey]);

  // 컴포넌트 언마운트 시 모든 타이머 정리
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  // 모든 toast가 사라지면 onClose 호출
  useEffect(() => {
    if (toasts.length > 0) {
      hasHadToastsRef.current = true;
    } else if (hasHadToastsRef.current) {
      hasHadToastsRef.current = false;
      stableOnClose();
    }
  }, [toasts.length, stableOnClose]);

  const getBgColor = (toastType?: 'success' | 'error' | 'info') => {
    switch (toastType) {
      case 'success':
        return 'bg-gray-700';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-gray-900';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-28 left-1/2 z-[100] -translate-x-1/2 flex flex-col-reverse gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-slide-up"
        >
          <div className={`rounded-lg px-4 py-2.5 text-sm text-white shadow-lg max-w-[90vw] whitespace-nowrap ${getBgColor(toast.type)}`}>
            {toast.message}
          </div>
        </div>
      ))}
    </div>
  );
}
