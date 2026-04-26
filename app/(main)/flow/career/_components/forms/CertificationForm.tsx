'use client';

import { useState } from 'react';
import { useSaveCareerCertifications } from '@/_lib/hooks/useCareer';
import type { Certification } from '@/_types/career';
import {
  AddRowButton,
  Field,
  FormFooter,
  RowCard,
  TextInput,
} from './formUi';

interface Props {
  certifications: Certification[];
  onClose: () => void;
  onSaveSuccess: () => void;
  onError: (msg: string) => void;
}

export default function CertificationForm({
  certifications,
  onClose,
  onSaveSuccess,
  onError,
}: Props) {
  const save = useSaveCareerCertifications();
  const [items, setItems] = useState<Certification[]>(
    certifications.length > 0
      ? certifications.map((c) => ({ ...c }))
      : [{ name: '', date: null }],
  );

  const update = (i: number, patch: Partial<Certification>) =>
    setItems((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const remove = (i: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  const add = () => setItems((prev) => [...prev, { name: '', date: null }]);

  const submit = async () => {
    const cleaned = items
      .map((c) => ({
        name: c.name.trim(),
        date: c.date && c.date.trim() ? c.date.trim() : null,
      }))
      .filter((c) => c.name);

    try {
      await save.mutateAsync({ certifications: cleaned });
      onSaveSuccess();
    } catch {
      onError('자격증 저장에 실패했어요');
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {items.map((c, i) => (
          <RowCard key={i} onRemove={() => remove(i)}>
            <Field label="자격증명">
              <TextInput
                value={c.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder="정보처리기사"
              />
            </Field>
            <Field label="취득일 (선택)">
              <TextInput
                value={c.date ?? ''}
                onChange={(e) => update(i, { date: e.target.value || null })}
                placeholder="2024.06"
              />
            </Field>
          </RowCard>
        ))}
        <AddRowButton onClick={add} label="자격증 추가" />
      </div>
      <FormFooter onCancel={onClose} onSubmit={submit} saving={save.isPending} />
    </div>
  );
}
