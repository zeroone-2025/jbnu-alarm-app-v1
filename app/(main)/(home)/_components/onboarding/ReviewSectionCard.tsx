'use client';

import type { ReactNode } from 'react';

interface ReviewSectionCardProps {
  title: string;
  description?: string;
  hasIssue?: boolean;
  onEdit?: () => void;
  children: ReactNode;
}

export default function ReviewSectionCard({
  title,
  description,
  hasIssue = false,
  onEdit,
  children,
}: ReviewSectionCardProps) {
  return (
    <section
      className={`rounded-xl border p-3 ${
        hasIssue ? 'border-red-300 bg-red-50/40' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description && <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500">{description}</p>}
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 rounded-md border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-600 transition-all hover:border-gray-400 hover:text-gray-800"
          >
            수정
          </button>
        )}
      </div>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}
