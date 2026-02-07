'use client';

import { ReactNode } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
}

export default function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  children,
  confirmLabel = '확인',
  cancelLabel = '취소',
  variant = 'default',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="w-[80%] max-w-xs rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        {title && (
          <p className="text-center text-base font-semibold text-gray-900 mb-2">{title}</p>
        )}
        <div className="text-center text-sm text-gray-600">{children}</div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all active:scale-95 ${variant === 'danger'
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
