'use client';

import type { ReactNode } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      {children}
    </label>
  );
}

const INPUT_BASE =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-gray-900';

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  const { className = '', ...rest } = props;
  return <input {...rest} className={`${INPUT_BASE} ${className}`} />;
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode },
) {
  const { className = '', children, ...rest } = props;
  return (
    <select {...rest} className={`${INPUT_BASE} ${className}`}>
      {children}
    </select>
  );
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  const { className = '', rows = 3, ...rest } = props;
  return (
    <textarea
      {...rest}
      rows={rows}
      className={`${INPUT_BASE} resize-none ${className}`}
    />
  );
}

export function RowCard({
  children,
  onRemove,
}: {
  children: ReactNode;
  onRemove?: () => void;
}) {
  return (
    <div className="relative space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="삭제"
          className="absolute right-2 top-2 rounded-md p-1 text-gray-400 transition-colors hover:bg-white hover:text-red-500"
        >
          <FiX size={14} />
        </button>
      )}
      {children}
    </div>
  );
}

export function AddRowButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 py-2.5 text-xs font-medium text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
    >
      <FiPlus size={14} />
      {label}
    </button>
  );
}

export function FormFooter({
  onCancel,
  onSubmit,
  saving,
  submitLabel = '저장하기',
}: {
  onCancel: () => void;
  onSubmit: () => void;
  saving: boolean;
  submitLabel?: string;
}) {
  return (
    <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3 pb-safe">
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="min-w-[72px] rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={saving}
          className="min-w-[96px] rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:bg-gray-300"
        >
          {saving ? '저장 중...' : submitLabel}
        </button>
      </div>
    </div>
  );
}
