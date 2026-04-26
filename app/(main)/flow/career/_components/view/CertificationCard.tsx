'use client';

import type { Certification } from '@/_types/career';
import SectionCard from './SectionCard';
import { pickPillColor, pillClasses } from '../colors';

interface Props {
  certifications: Certification[];
  onEdit?: () => void;
}

export default function CertificationCard({ certifications, onEdit }: Props) {
  const empty = certifications.length === 0;

  return (
    <SectionCard
      emoji="📜"
      title="자격증"
      count={empty ? undefined : certifications.length}
      onEdit={onEdit}
      empty={empty}
      emptyText="자격증을 추가해보세요"
    >
      <div className="flex flex-wrap gap-2">
        {certifications.map((c, i) => (
          <span
            key={c.id ?? `${c.name}-${i}`}
            className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-medium ${pillClasses(pickPillColor(i))}`}
            title={c.date ? `취득: ${c.date}` : undefined}
          >
            {c.name}
          </span>
        ))}
      </div>
    </SectionCard>
  );
}
