'use client';

import { useState } from 'react';
import { useSaveCareerMentorQnA } from '@/_lib/hooks/useCareer';
import type { MentorQnA } from '@/_types/career';
import { Field, FormFooter, TextArea } from './formUi';

interface Props {
  qna: MentorQnA | null;
  onClose: () => void;
  onSaveSuccess: () => void;
  onError: (msg: string) => void;
}

const FIELDS: { key: keyof MentorQnA; label: string; placeholder: string }[] = [
  {
    key: 'reason_for_local',
    label: '왜 지역에서 일하기로 결심하셨나요?',
    placeholder: '지역에서 일하게 된 계기를 들려주세요.',
  },
  {
    key: 'helpful_organizations',
    label: '청년에게 도움이 되는 기관/제도는?',
    placeholder: '도움이 되었던 지원사업이나 기관을 적어주세요.',
  },
  {
    key: 'local_advantages',
    label: '지역에서 일할 때 좋은 점은?',
    placeholder: '지역 근무의 장점을 들려주세요.',
  },
  {
    key: 'local_disadvantages',
    label: '아쉬운 점은?',
    placeholder: '아쉽거나 개선되었으면 하는 부분.',
  },
  {
    key: 'advice_for_juniors',
    label: '후배에게 한마디',
    placeholder: '후배들에게 전하고 싶은 조언.',
  },
];

const empty: MentorQnA = {
  targeted_capital: null,
  reason_for_local: null,
  helpful_organizations: null,
  local_advantages: null,
  local_disadvantages: null,
  advice_for_juniors: null,
};

export default function MentorQnAForm({ qna, onClose, onSaveSuccess, onError }: Props) {
  const save = useSaveCareerMentorQnA();
  const [data, setData] = useState<MentorQnA>(qna ?? empty);

  const submit = async () => {
    try {
      await save.mutateAsync({ mentor_qna: data });
      onSaveSuccess();
    } catch {
      onError('Q&A 저장에 실패했어요');
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <Field label="처음에는 수도권 취업을 목표로 하셨나요?">
          <div className="space-y-2 pt-1 text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-gray-700">
              <input
                type="radio"
                checked={data.targeted_capital === true}
                onChange={() => setData({ ...data, targeted_capital: true })}
                className="h-4 w-4 accent-gray-900"
              />
              예
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-gray-700">
              <input
                type="radio"
                checked={data.targeted_capital === false}
                onChange={() => setData({ ...data, targeted_capital: false })}
                className="h-4 w-4 accent-gray-900"
              />
              아니오
            </label>
          </div>
        </Field>

        {FIELDS.map(({ key, label, placeholder }) => (
          <Field key={key} label={label}>
            <TextArea
              rows={3}
              value={(data[key] as string | null) ?? ''}
              onChange={(e) => setData({ ...data, [key]: e.target.value || null })}
              placeholder={placeholder}
            />
          </Field>
        ))}
      </div>
      <FormFooter onCancel={onClose} onSubmit={submit} saving={save.isPending} />
    </div>
  );
}
