'use client';

import type { Education } from '@/_types/career';
import { DEGREE_LABELS, STATUS_LABELS } from '@/_types/career';
import SectionCard from './SectionCard';
import {
  hashColorIndex,
  makeAbbrev,
  pickPillColor,
  squareClasses,
} from '../colors';

interface Props {
  educations: Education[];
  onEdit?: () => void;
}

function formatPeriod(e: Education) {
  const end = e.is_current ? '재학중' : e.end_date ?? '';
  return [e.start_date, end].filter(Boolean).join(' ~ ');
}

export default function EducationCard({ educations, onEdit }: Props) {
  const empty = educations.length === 0;

  return (
    <SectionCard
      emoji="🎓"
      title="학력"
      count={empty ? undefined : educations.length}
      onEdit={onEdit}
      empty={empty}
      emptyText="학력을 등록해보세요"
    >
      <div className="space-y-3">
        {educations.map((e, i) => {
          const color = pickPillColor(hashColorIndex(e.school));
          return (
            <div
              key={e.id ?? `${e.school}-${i}`}
              className="flex gap-3 rounded-xl bg-gray-50 p-3"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${squareClasses(color)}`}
              >
                {makeAbbrev(e.school)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {e.school}
                  <span className="ml-1.5 text-xs font-normal text-gray-500">
                    {e.major}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {[
                    DEGREE_LABELS[e.degree],
                    STATUS_LABELS[e.status],
                    formatPeriod(e),
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
