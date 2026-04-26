'use client';

import { useState } from 'react';
import { useSaveCareerActivities } from '@/_lib/hooks/useCareer';
import {
  ACTIVITY_KIND_LABELS,
  type Activity,
  type ActivityKind,
} from '@/_types/career';
import {
  AddRowButton,
  Field,
  FormFooter,
  RowCard,
  TextInput,
} from './formUi';

interface Props {
  /** 현재 편집 대상 kind */
  kind: ActivityKind;
  /** 전체 activities (다른 kind는 그대로 유지하기 위해 함께 PUT) */
  allActivities: Activity[];
  onClose: () => void;
  onSaveSuccess: () => void;
  onError: (msg: string) => void;
}

const PLACEHOLDERS: Record<ActivityKind, { name: string; period: string; desc: string }> = {
  experience: {
    name: '교내 교육 시스템 Litmus 유지보수',
    period: '2024.03 - 2025.02',
    desc: '전북대학교 · 1년',
  },
  award: {
    name: '전북대 아이디어 해커톤',
    period: '2025',
    desc: '최우수상',
  },
  etc: {
    name: '활동명',
    period: '2024',
    desc: '간단한 설명',
  },
};

export default function ActivityForm({
  kind,
  allActivities,
  onClose,
  onSaveSuccess,
  onError,
}: Props) {
  const save = useSaveCareerActivities();
  const myList = allActivities.filter((a) => a.kind === kind);
  const otherList = allActivities.filter((a) => a.kind !== kind);

  const blank: Activity = { name: '', period: null, description: null, kind };

  const [items, setItems] = useState<Activity[]>(
    myList.length > 0 ? myList.map((a) => ({ ...a })) : [{ ...blank }],
  );

  const update = (i: number, patch: Partial<Activity>) =>
    setItems((prev) => prev.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));
  const remove = (i: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  const add = () => setItems((prev) => [...prev, { ...blank }]);

  const submit = async () => {
    const cleaned = items
      .map((a) => ({
        name: a.name.trim(),
        period: a.period && a.period.trim() ? a.period.trim() : null,
        description: a.description && a.description.trim() ? a.description.trim() : null,
        kind,
      }))
      .filter((a) => a.name);

    const payload = [...otherList.map(({ id, ...rest }) => rest), ...cleaned];

    try {
      await save.mutateAsync({ activities: payload });
      onSaveSuccess();
    } catch {
      onError(`${ACTIVITY_KIND_LABELS[kind]} 저장에 실패했어요`);
    }
  };

  const ph = PLACEHOLDERS[kind];

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {items.map((a, i) => (
          <RowCard key={i} onRemove={() => remove(i)}>
            <Field label={`${ACTIVITY_KIND_LABELS[kind]} 이름`}>
              <TextInput
                value={a.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder={ph.name}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="기간 (선택)">
                <TextInput
                  value={a.period ?? ''}
                  onChange={(e) => update(i, { period: e.target.value || null })}
                  placeholder={ph.period}
                />
              </Field>
              <Field label="간단 설명 (선택)">
                <TextInput
                  value={a.description ?? ''}
                  onChange={(e) => update(i, { description: e.target.value || null })}
                  placeholder={ph.desc}
                />
              </Field>
            </div>
            {kind === 'award' && (
              <p className="text-[11px] text-gray-400">
                팁: 이름이나 설명에 “최우수/우수/장려” 같은 키워드가 있으면 메달 색상이
                자동으로 바뀌어요 🥇🥈🥉
              </p>
            )}
          </RowCard>
        ))}
        <AddRowButton onClick={add} label={`${ACTIVITY_KIND_LABELS[kind]} 추가`} />
      </div>
      <FormFooter onCancel={onClose} onSubmit={submit} saving={save.isPending} />
    </div>
  );
}
