'use client';

import { useState } from 'react';
import { useSaveCareerContact } from '@/_lib/hooks/useCareer';
import type { CareerProfile } from '@/_types/career';
import { Field, FormFooter, TextInput } from './formUi';

interface Props {
  profile: CareerProfile | null;
  onClose: () => void;
  onSaveSuccess: () => void;
  onError: (msg: string) => void;
}

export default function ContactForm({ profile, onClose, onSaveSuccess, onError }: Props) {
  const save = useSaveCareerContact();
  const [name, setName] = useState(profile?.name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');

  const submit = async () => {
    try {
      await save.mutateAsync({
        name,
        email,
        phone,
        visibility: profile?.visibility ?? 'private',
      });
      onSaveSuccess();
    } catch {
      onError('연락 정보 저장에 실패했어요');
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <Field label="이름">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
          />
        </Field>
        <Field label="이메일">
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
        </Field>
        <Field label="연락처">
          <TextInput
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-1234-5678"
          />
        </Field>
      </div>
      <FormFooter onCancel={onClose} onSubmit={submit} saving={save.isPending} />
    </div>
  );
}
