'use client';

import type { WorkExperience } from '@/_types/career';
import { EMPLOYMENT_TYPE_LABELS } from '@/_types/career';
import SectionCard from './SectionCard';
import {
  hashColorIndex,
  makeAbbrev,
  pickPillColor,
  squareClasses,
} from '../colors';

interface Props {
  works: WorkExperience[];
  onEdit?: () => void;
}

function formatPeriod(w: WorkExperience) {
  const end = w.is_current ? '재직중' : w.end_date ?? '';
  return [w.start_date, end].filter(Boolean).join(' ~ ');
}

export default function WorkCard({ works, onEdit }: Props) {
  const empty = works.length === 0;

  return (
    <SectionCard
      emoji="🏢"
      title="경력"
      count={empty ? undefined : works.length}
      onEdit={onEdit}
      empty={empty}
      emptyText="경력을 등록해보세요"
    >
      <div className="space-y-3">
        {works.map((w, i) => {
          const color = pickPillColor(hashColorIndex(w.company));
          return (
            <div
              key={w.id ?? `${w.company}-${i}`}
              className="flex gap-3 rounded-xl bg-gray-50 p-3"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${squareClasses(color)}`}
              >
                {makeAbbrev(w.company)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {w.company}
                  <span className="ml-1.5 text-xs font-normal text-gray-500">
                    {w.position}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {[
                    EMPLOYMENT_TYPE_LABELS[w.employment_type],
                    formatPeriod(w),
                    w.region,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
