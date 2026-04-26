'use client';

import type { Activity } from '@/_types/career';
import SectionCard from './SectionCard';
import { AWARD_TIER_STYLE, inferAwardTier } from '../colors';

interface Props {
  awards: Activity[];
  onEdit?: () => void;
}

export default function AwardCard({ awards, onEdit }: Props) {
  const empty = awards.length === 0;

  return (
    <SectionCard
      emoji="🏆"
      title="수상"
      count={empty ? undefined : awards.length}
      onEdit={onEdit}
      empty={empty}
      emptyText="수상 기록을 추가해보세요"
    >
      <div className="space-y-2">
        {awards.map((a, i) => {
          const tier = inferAwardTier(a.description ?? a.name);
          const style = AWARD_TIER_STYLE[tier];
          return (
            <div
              key={a.id ?? `${a.name}-${i}`}
              className={`flex items-center gap-3 rounded-xl p-3 ${style.bg}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${style.medalBg}`}
              >
                {style.medalEmoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{a.name}</p>
                {(a.description || a.period) && (
                  <p className={`text-xs ${style.subText}`}>
                    {[a.description, a.period].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
