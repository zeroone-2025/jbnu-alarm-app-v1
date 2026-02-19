'use client';

import { useState, useEffect } from 'react';
import { FiEdit3, FiUser, FiMail, FiPhone, FiLock } from 'react-icons/fi';
import { useSaveCareerContact } from '@/_lib/hooks/useCareer';
import type { CareerProfile } from '@/_types/career';

interface ContactSectionProps {
  profile: CareerProfile | null;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSaveSuccess: () => void;
  isEmpty: boolean;
}

export default function ContactSection({
  profile,
  isEditing,
  onEdit,
  onCancel,
  onSaveSuccess,
  isEmpty,
}: ContactSectionProps) {
  const saveMutation = useSaveCareerContact();

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    visibility: (profile?.visibility || 'career_only') as 'public' | 'career_only',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        visibility: profile.visibility,
      });
    }
  }, [profile]);

  const handleSubmit = async () => {
    try {
      await saveMutation.mutateAsync(formData);
      onSaveSuccess();
    } catch (error) {
      console.error('연락 정보 저장 실패:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        visibility: profile.visibility,
      });
    }
    onCancel();
  };

  if (isEditing) {
    return (
      <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-1.5">
              <FiUser size={14} className="text-gray-400" />
              이름
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="이름을 입력하세요"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-gray-900"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-1.5">
              <FiMail size={14} className="text-gray-400" />
              이메일
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-gray-900"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-1.5">
              <FiPhone size={14} className="text-gray-400" />
              연락처
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="010-1234-5678"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-gray-900"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-2">
              <FiLock size={14} className="text-gray-400" />
              공개범위
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="public"
                  checked={formData.visibility === 'public'}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value as 'public' })}
                  className="h-4 w-4 text-gray-900"
                />
                <span className="text-sm text-gray-700">전체 공개</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="career_only"
                  checked={formData.visibility === 'career_only'}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value as 'career_only' })}
                  className="h-4 w-4 text-gray-900"
                />
                <span className="text-sm text-gray-700">이력만 공개 (연락처 비공개)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={handleCancel}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-400 transition-all hover:text-gray-600"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={saveMutation.isPending}
            className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-bold text-white transition-all hover:bg-gray-800 disabled:bg-gray-300"
          >
            {saveMutation.isPending ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={onEdit}
        className="absolute right-0 top-0 text-gray-300 transition-colors hover:text-gray-500"
        aria-label="연락 정보 수정"
      >
        <FiEdit3 size={16} />
      </button>

      <div className="text-center">
        <h1 className="text-xl font-bold tracking-widest text-gray-900">
          <span className={profile?.name ? 'text-gray-900' : 'text-gray-300'}>
            {profile?.name || '이  름'}
          </span>
        </h1>
        <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <span className={profile?.email ? 'text-gray-400' : 'text-gray-300'}>
            {profile?.email || 'email@example.com'}
          </span>
          {profile?.phone && (
            <>
              <span>·</span>
              <span className="text-gray-400">{profile.phone}</span>
            </>
          )}
        </div>
        <div className="mt-1.5 flex items-center justify-center gap-1 text-[10px] text-gray-300">
          <FiLock size={10} />
          <span>{profile?.visibility === 'public' ? '전체 공개' : '이력만 공개'}</span>
        </div>
      </div>
    </div>
  );
}
