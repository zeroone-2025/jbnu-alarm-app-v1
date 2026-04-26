'use client';

import type { MentorQnA } from '@/_types/career';
import SectionCard from './SectionCard';

interface Props {
  qna: MentorQnA | null;
  onEdit?: () => void;
}

const QUESTIONS: { key: keyof MentorQnA; label: string }[] = [
  { key: 'reason_for_local', label: '왜 지역에서 일하기로 결심하셨나요?' },
  { key: 'helpful_organizations', label: '청년에게 도움이 되는 기관/제도는?' },
  { key: 'local_advantages', label: '지역에서 일할 때 좋은 점은?' },
  { key: 'local_disadvantages', label: '아쉬운 점은?' },
  { key: 'advice_for_juniors', label: '후배에게 한마디' },
];

export default function MentorQnACard({ qna, onEdit }: Props) {
  const filled = QUESTIONS.filter(({ key }) => Boolean(qna?.[key])).length;
  const empty = filled === 0;

  return (
    <SectionCard
      emoji="🌟"
      title="선배님 Q&A"
      count={empty ? undefined : filled}
      onEdit={onEdit}
      empty={empty}
      emptyText="후배에게 들려줄 이야기를 작성해보세요"
    >
      <div className="space-y-4">
        {QUESTIONS.map(({ key, label }) => {
          const v = qna?.[key];
          if (!v || typeof v !== 'string') return null;
          return (
            <div key={key}>
              <p className="text-xs font-bold text-purple-600">Q. {label}</p>
              <p className="mt-1.5 rounded-r-lg border-l-2 border-purple-300 bg-gray-50 py-2 pl-3 pr-3 text-sm leading-relaxed text-gray-700 break-keep">
                {v}
              </p>
            </div>
          );
        })}
        {qna?.targeted_capital !== null && qna?.targeted_capital !== undefined && (
          <p className="text-xs text-gray-500">
            수도권 취업을 목표로 했나요?{' '}
            <span className="font-medium text-gray-700">
              {qna.targeted_capital ? '예' : '아니오'}
            </span>
          </p>
        )}
      </div>
    </SectionCard>
  );
}
