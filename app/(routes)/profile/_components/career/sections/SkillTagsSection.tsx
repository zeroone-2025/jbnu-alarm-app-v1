'use client';

import { useState, useEffect } from 'react';
import { FiEdit3, FiX } from 'react-icons/fi';
import { useSaveCareerSkills } from '@/_lib/hooks/useCareer';
import type { CareerProfile } from '@/_types/career';

interface SkillTagsSectionProps {
  profile: CareerProfile | null;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSaveSuccess: () => void;
  isEmpty: boolean;
}

export default function SkillTagsSection({
  profile,
  isEditing,
  onEdit,
  onCancel,
  onSaveSuccess,
  isEmpty,
}: SkillTagsSectionProps) {
  const saveMutation = useSaveCareerSkills();
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (profile) {
      setSkillTags(profile.skill_tags || []);
    } else {
      setSkillTags([]);
    }
  }, [profile]);

  const handleAddTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !skillTags.includes(trimmed)) {
      setSkillTags([...skillTags, trimmed]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSkillTags(skillTags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async () => {
    try {
      await saveMutation.mutateAsync({ skill_tags: skillTags });
      onSaveSuccess();
    } catch (error) {
      console.error('직무 키워드 저장 실패:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCancel = () => {
    if (profile) {
      setSkillTags(profile.skill_tags || []);
    } else {
      setSkillTags([]);
    }
    setInputValue('');
    onCancel();
  };

  if (isEditing) {
    return (
      <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">직무 키워드 추가</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="예: Python, React, AWS..."
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
              <button
                onClick={handleAddTag}
                className="rounded-lg bg-gray-900 px-4 text-sm font-bold text-white transition-all hover:bg-gray-800"
              >
                추가
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {skillTags.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => handleRemoveTag(tag)}
                className="flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-gray-700"
              >
                {tag}
                <FiX size={12} strokeWidth={3} />
              </button>
            ))}
          </div>

          {skillTags.length === 0 && (
            <p className="text-xs text-gray-400">키워드를 입력하고 추가 버튼을 눌러주세요</p>
          )}
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

  const displayTags = isEmpty ? ['Python', 'React', 'TypeScript'] : profile?.skill_tags || [];

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold tracking-widest text-gray-900">직무 키워드</h3>
        <button
          onClick={onEdit}
          className="text-gray-300 transition-colors hover:text-gray-500"
          aria-label="직무 키워드 수정"
        >
          <FiEdit3 size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {displayTags.map((tag, idx) => (
          <span
            key={idx}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              isEmpty ? 'bg-gray-100 text-gray-300' : 'bg-gray-800 text-white'
            }`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
