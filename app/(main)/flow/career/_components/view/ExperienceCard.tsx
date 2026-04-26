'use client';

import type { Activity } from '@/_types/career';
import SectionCard from './SectionCard';
import {
  hashColorIndex,
  makeAbbrev,
  pickPillColor,
  squareClasses,
} from '../colors';

interface Props {
  experiences: Activity[];
  onEdit?: () => void;
}

export default function ExperienceCard({ experiences, onEdit }: Props) {
  const empty = experiences.length === 0;

  return (
    <SectionCard
      emoji="💼"
      title="경험"
      count={empty ? undefined : experiences.length}
      onEdit={onEdit}
      empty={empty}
      emptyText="인턴, 연구실, 프로젝트 등 경험을 기록해보세요"
    >
      <div className="space-y-3">
        {experiences.map((a, i) => {
          const color = pickPillColor(hashColorIndex(a.name));
          return (
            <div
              key={a.id ?? `${a.name}-${i}`}
              className="flex gap-3 rounded-xl bg-gray-50 p-3"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${squareClasses(color)}`}
              >
                {makeAbbrev(a.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{a.name}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {[a.period, a.description].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
