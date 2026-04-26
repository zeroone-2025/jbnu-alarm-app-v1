'use client';

import { useState } from 'react';
import { useSaveCareerEducations } from '@/_lib/hooks/useCareer';
import {
  DEGREE_LABELS,
  STATUS_LABELS,
  type Education,
} from '@/_types/career';
import {
  AddRowButton,
  Field,
  FormFooter,
  RowCard,
  Select,
  TextInput,
} from './formUi';

interface Props {
  educations: Education[];
  onClose: () => void;
  onSaveSuccess: () => void;
  onError: (msg: string) => void;
}

const blank: Education = {
  start_date: '',
  end_date: null,
  is_current: false,
  school: '',
  major: '',
  degree: 'bachelor',
  status: 'enrolled',
  region: '',
};

export default function EducationForm({
  educations,
  onClose,
  onSaveSuccess,
  onError,
}: Props) {
  const save = useSaveCareerEducations();
  const [items, setItems] = useState<Education[]>(
    educations.length > 0 ? educations.map((e) => ({ ...e })) : [{ ...blank }],
  );

  const update = (i: number, patch: Partial<Education>) =>
    setItems((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  const remove = (i: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  const add = () => setItems((prev) => [...prev, { ...blank }]);

  const submit = async () => {
    const cleaned = items
      .filter((e) => e.school.trim() && e.major.trim() && e.start_date.trim())
      .map((e) => ({
        ...e,
        end_date: e.is_current ? null : e.end_date && e.end_date.trim() ? e.end_date.trim() : null,
      }));

    try {
      await save.mutateAsync({ educations: cleaned });
      onSaveSuccess();
    } catch {
      onError('학력 저장에 실패했어요');
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {items.map((e, i) => (
          <RowCard key={i} onRemove={() => remove(i)}>
            <div className="grid grid-cols-2 gap-2">
              <Field label="학교">
                <TextInput
                  value={e.school}
                  onChange={(ev) => update(i, { school: ev.target.value })}
                  placeholder="전북대학교"
                />
              </Field>
              <Field label="전공">
                <TextInput
                  value={e.major}
                  onChange={(ev) => update(i, { major: ev.target.value })}
                  placeholder="컴퓨터공학부"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="학위">
                <Select
                  value={e.degree}
                  onChange={(ev) => update(i, { degree: ev.target.value as Education['degree'] })}
                >
                  {(Object.keys(DEGREE_LABELS) as Education['degree'][]).map((k) => (
                    <option key={k} value={k}>
                      {DEGREE_LABELS[k]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="상태">
                <Select
                  value={e.status}
                  onChange={(ev) => update(i, { status: ev.target.value as Education['status'] })}
                >
                  {(Object.keys(STATUS_LABELS) as Education['status'][]).map((k) => (
                    <option key={k} value={k}>
                      {STATUS_LABELS[k]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="시작">
                <TextInput
                  value={e.start_date}
                  onChange={(ev) => update(i, { start_date: ev.target.value })}
                  placeholder="2020.03"
                />
              </Field>
              <Field label="종료">
                <TextInput
                  value={e.end_date ?? ''}
                  disabled={e.is_current}
                  onChange={(ev) => update(i, { end_date: ev.target.value || null })}
                  placeholder="2024.02"
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={e.is_current}
                onChange={(ev) =>
                  update(i, {
                    is_current: ev.target.checked,
                    end_date: ev.target.checked ? null : e.end_date,
                  })
                }
                className="h-4 w-4 accent-gray-900"
              />
              현재 재학/재직 중
            </label>
          </RowCard>
        ))}
        <AddRowButton onClick={add} label="학력 추가" />
      </div>
      <FormFooter onCancel={onClose} onSubmit={submit} saving={save.isPending} />
    </div>
  );
}
