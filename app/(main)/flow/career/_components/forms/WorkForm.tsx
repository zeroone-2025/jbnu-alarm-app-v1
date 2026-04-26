'use client';

import { useState } from 'react';
import { useSaveCareerWorks } from '@/_lib/hooks/useCareer';
import {
  EMPLOYMENT_TYPE_LABELS,
  type WorkExperience,
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
  works: WorkExperience[];
  onClose: () => void;
  onSaveSuccess: () => void;
  onError: (msg: string) => void;
}

const blank: WorkExperience = {
  start_date: '',
  end_date: null,
  is_current: false,
  company: '',
  position: '',
  employment_type: 'full_time',
  region: '',
};

export default function WorkForm({ works, onClose, onSaveSuccess, onError }: Props) {
  const save = useSaveCareerWorks();
  const [items, setItems] = useState<WorkExperience[]>(
    works.length > 0 ? works.map((w) => ({ ...w })) : [{ ...blank }],
  );

  const update = (i: number, patch: Partial<WorkExperience>) =>
    setItems((prev) => prev.map((w, idx) => (idx === i ? { ...w, ...patch } : w)));
  const remove = (i: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  const add = () => setItems((prev) => [...prev, { ...blank }]);

  const submit = async () => {
    const cleaned = items
      .filter((w) => w.company.trim() && w.position.trim() && w.start_date.trim())
      .map((w) => ({
        ...w,
        end_date: w.is_current ? null : w.end_date && w.end_date.trim() ? w.end_date.trim() : null,
      }));

    try {
      await save.mutateAsync({ works: cleaned });
      onSaveSuccess();
    } catch {
      onError('경력 저장에 실패했어요');
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {items.map((w, i) => (
          <RowCard key={i} onRemove={() => remove(i)}>
            <div className="grid grid-cols-2 gap-2">
              <Field label="회사">
                <TextInput
                  value={w.company}
                  onChange={(ev) => update(i, { company: ev.target.value })}
                  placeholder="회사명"
                />
              </Field>
              <Field label="직무">
                <TextInput
                  value={w.position}
                  onChange={(ev) => update(i, { position: ev.target.value })}
                  placeholder="백엔드 개발자"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="고용형태">
                <Select
                  value={w.employment_type}
                  onChange={(ev) =>
                    update(i, {
                      employment_type: ev.target.value as WorkExperience['employment_type'],
                    })
                  }
                >
                  {(Object.keys(EMPLOYMENT_TYPE_LABELS) as WorkExperience['employment_type'][]).map(
                    (k) => (
                      <option key={k} value={k}>
                        {EMPLOYMENT_TYPE_LABELS[k]}
                      </option>
                    ),
                  )}
                </Select>
              </Field>
              <Field label="지역 (선택)">
                <TextInput
                  value={w.region ?? ''}
                  onChange={(ev) => update(i, { region: ev.target.value })}
                  placeholder="전주"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="시작">
                <TextInput
                  value={w.start_date}
                  onChange={(ev) => update(i, { start_date: ev.target.value })}
                  placeholder="2024.07"
                />
              </Field>
              <Field label="종료">
                <TextInput
                  value={w.end_date ?? ''}
                  disabled={w.is_current}
                  onChange={(ev) => update(i, { end_date: ev.target.value || null })}
                  placeholder="2025.06"
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={w.is_current}
                onChange={(ev) =>
                  update(i, {
                    is_current: ev.target.checked,
                    end_date: ev.target.checked ? null : w.end_date,
                  })
                }
                className="h-4 w-4 accent-gray-900"
              />
              현재 재직 중
            </label>
          </RowCard>
        ))}
        <AddRowButton onClick={add} label="경력 추가" />
      </div>
      <FormFooter onCancel={onClose} onSubmit={submit} saving={save.isPending} />
    </div>
  );
}
