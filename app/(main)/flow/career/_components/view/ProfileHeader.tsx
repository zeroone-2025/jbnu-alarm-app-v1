'use client';

import { FiEdit3, FiUser } from 'react-icons/fi';
import type { CareerVisibility } from '@/_types/career';
import type { UserProfile } from '@/_types/user';

interface Props {
  user: UserProfile | null;
  deptName?: string | null;
  isMentor?: boolean;
  visibility?: CareerVisibility;
  onEdit?: () => void;
  summary?: {
    languageScores: number;
    certifications: number;
    experiences: number;
    awards: number;
  };
}

const VISIBILITY_META: Record<CareerVisibility, { label: string; className: string }> = {
  private: {
    label: '비공개',
    className: 'bg-gray-100 text-gray-600',
  },
  career_only: {
    label: '이력 공개',
    className: 'bg-blue-100 text-blue-700',
  },
  public: {
    label: '전체 공개',
    className: 'bg-emerald-100 text-emerald-700',
  },
};

function admissionLabel(year: number | null | undefined): string | null {
  if (!year) return null;
  return `${String(year).slice(-2)}학번`;
}

export default function ProfileHeader({
  user,
  deptName,
  isMentor,
  visibility = 'private',
  onEdit,
  summary,
}: Props) {
  const initial = (user?.nickname || user?.email || 'U').charAt(0);
  const admission = admissionLabel(user?.admission_year);
  const visibilityMeta = VISIBILITY_META[visibility];
  const summaryItems = summary
    ? [
        { label: '어학', count: summary.languageScores },
        { label: '자격증', count: summary.certifications },
        { label: '경험', count: summary.experiences },
        { label: '수상', count: summary.awards },
      ].filter((item) => item.count > 0)
    : [];

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        {user?.profile_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.profile_image}
            alt={user.nickname || '프로필'}
            className="h-20 w-20 rounded-full border border-gray-100 object-cover"
          />
        ) : user ? (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold text-white shadow-lg">
            {initial}
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <FiUser size={32} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-2xl font-bold text-gray-900">
              {user?.nickname || '이름 없음'}
            </h1>
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                aria-label="프로필 정보 수정"
                className="rounded-md p-1 text-gray-300 transition-colors hover:bg-gray-50 hover:text-gray-600"
              >
                <FiEdit3 size={14} />
              </button>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-gray-500">
            {[user?.school, deptName].filter(Boolean).join(' · ') || '학교 정보 없음'}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            {admission && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                {admission}
              </span>
            )}
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                isMentor
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isMentor ? '멘토' : '취업준비'}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${visibilityMeta.className}`}
            >
              {visibilityMeta.label}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-gray-100 pt-4">
        {summaryItems.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {summaryItems.map((item) => (
              <div key={item.label} className="rounded-xl bg-gray-50 px-3 py-2">
                <p className="text-[11px] font-medium text-gray-400">{item.label}</p>
                <p className="mt-0.5 text-base font-bold text-gray-900">{item.count}개</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-gray-50 px-3 py-3 text-xs text-gray-400">
            이력 정보를 추가하면 요약이 표시됩니다.
          </div>
        )}
      </div>
    </div>
  );
}
