'use client';

import { useState } from 'react';
import { useSaveCareerLanguageScores } from '@/_lib/hooks/useCareer';
import type { LanguageScore } from '@/_types/career';
import {
  AddRowButton,
  Field,
  FormFooter,
  RowCard,
  TextInput,
} from './formUi';

interface Props {
  scores: LanguageScore[];
  onClose: () => void;
  onSaveSuccess: () => void;
  onError: (msg: string) => void;
}

const TYPE_PRESETS = ['TOEIC', 'TOEFL', 'OPIc', 'TOEIC Speaking', 'JLPT', 'HSK'];

export default function LanguageScoreForm({
  scores,
  onClose,
  onSaveSuccess,
  onError,
}: Props) {
  const save = useSaveCareerLanguageScores();
  const [items, setItems] = useState<LanguageScore[]>(
    scores.length > 0
      ? scores.map((s) => ({ ...s }))
      : [{ test_type: 'TOEIC', score: '', date: null }],
  );

  const update = (i: number, patch: Partial<LanguageScore>) =>
    setItems((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const remove = (i: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  const add = () =>
    setItems((prev) => [...prev, { test_type: 'TOEIC', score: '', date: null }]);

  const submit = async () => {
    const cleaned = items
      .map((s) => ({
        test_type: s.test_type.trim(),
        score: s.score.trim(),
        date: s.date && s.date.trim() ? s.date.trim() : null,
      }))
      .filter((s) => s.test_type && s.score);

    try {
      await save.mutateAsync({ language_scores: cleaned });
      onSaveSuccess();
    } catch {
      onError('어학 점수 저장에 실패했어요');
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {items.map((s, i) => (
          <RowCard key={i} onRemove={() => remove(i)}>
            <Field label="시험">
              <TextInput
                list="lang-test-types"
                value={s.test_type}
                onChange={(e) => update(i, { test_type: e.target.value })}
                placeholder="TOEIC"
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="점수">
                <TextInput
                  value={s.score}
                  onChange={(e) => update(i, { score: e.target.value })}
                  placeholder="850"
                />
              </Field>
              <Field label="취득일 (선택)">
                <TextInput
                  value={s.date ?? ''}
                  onChange={(e) => update(i, { date: e.target.value || null })}
                  placeholder="2024.06"
                />
              </Field>
            </div>
          </RowCard>
        ))}
        <datalist id="lang-test-types">
          {TYPE_PRESETS.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
        <AddRowButton onClick={add} label="어학 점수 추가" />
      </div>
      <FormFooter onCancel={onClose} onSubmit={submit} saving={save.isPending} />
    </div>
  );
}
