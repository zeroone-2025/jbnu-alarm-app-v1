'use client';

import type { LanguageScore } from '@/_types/career';
import SectionCard from './SectionCard';

interface Props {
  scores: LanguageScore[];
  onEdit?: () => void;
}

export default function LanguageScoreCard({ scores, onEdit }: Props) {
  const empty = scores.length === 0;

  return (
    <SectionCard
      emoji="🌐"
      title="어학"
      onEdit={onEdit}
      empty={empty}
      emptyText="어학 점수를 등록해보세요"
    >
      <div className="space-y-2">
        {scores.map((s, i) => (
          <div
            key={s.id ?? `${s.test_type}-${i}`}
            className="flex items-center justify-between"
          >
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              {s.test_type}
            </span>
            <span className="text-sm font-semibold text-gray-700">
              {s.score}
              {s.date && (
                <span className="ml-1.5 text-xs font-normal text-gray-400">{s.date}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
