'use client';

import SectionCard from './SectionCard';

interface Props {
  tags: string[];
  onEdit?: () => void;
}

export default function SkillTagsCard({ tags, onEdit }: Props) {
  const empty = tags.length === 0;

  return (
    <SectionCard
      emoji="🛠️"
      title="직무 키워드"
      count={empty ? undefined : tags.length}
      onEdit={onEdit}
      empty={empty}
      emptyText="관심 있는 직무 키워드를 등록해보세요"
    >
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
          >
            #{t}
          </span>
        ))}
      </div>
    </SectionCard>
  );
}
