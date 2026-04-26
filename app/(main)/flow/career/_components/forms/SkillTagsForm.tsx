'use client';

import { useState, type KeyboardEvent } from 'react';
import { FiX } from 'react-icons/fi';
import { useSaveCareerSkills } from '@/_lib/hooks/useCareer';
import { Field, FormFooter, TextInput } from './formUi';

interface Props {
  tags: string[];
  onClose: () => void;
  onSaveSuccess: () => void;
  onError: (msg: string) => void;
}

export default function SkillTagsForm({
  tags,
  onClose,
  onSaveSuccess,
  onError,
}: Props) {
  const save = useSaveCareerSkills();
  const [list, setList] = useState<string[]>(tags);
  const [input, setInput] = useState('');

  const commit = () => {
    const v = input.trim().replace(/^#/, '');
    if (!v) return;
    if (list.includes(v)) {
      setInput('');
      return;
    }
    setList((prev) => [...prev, v]);
    setInput('');
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && !input && list.length > 0) {
      setList((prev) => prev.slice(0, -1));
    }
  };

  const remove = (i: number) =>
    setList((prev) => prev.filter((_, idx) => idx !== i));

  const submit = async () => {
    try {
      await save.mutateAsync({ skill_tags: list });
      onSaveSuccess();
    } catch {
      onError('직무 키워드 저장에 실패했어요');
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <Field label="직무 키워드">
          <div className="rounded-lg border border-gray-200 bg-white p-2">
            <div className="flex flex-wrap gap-1.5">
              {list.map((t, i) => (
                <span
                  key={`${t}-${i}`}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label={`${t} 삭제`}
                    className="rounded-full hover:bg-gray-200"
                  >
                    <FiX size={12} />
                  </button>
                </span>
              ))}
              <TextInput
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                onBlur={commit}
                placeholder="키워드 입력 후 Enter"
                className="!w-auto !min-w-32 flex-1 !border-0 !bg-transparent !p-0 !py-0.5 focus:!ring-0"
              />
            </div>
          </div>
          <p className="mt-1.5 text-[11px] text-gray-400">
            엔터 또는 콤마로 추가, 백스페이스로 삭제
          </p>
        </Field>
      </div>
      <FormFooter onCancel={onClose} onSubmit={submit} saving={save.isPending} />
    </div>
  );
}
