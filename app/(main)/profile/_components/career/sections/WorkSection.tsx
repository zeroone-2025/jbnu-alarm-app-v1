'use client';

import { useEffect, useState } from 'react';

import { FiEdit3, FiPlus, FiTrash2 } from 'react-icons/fi';

import { useSaveCareerWorks } from '@/_lib/hooks/useCareer';
import { EMPLOYMENT_TYPE_LABELS } from '@/_types/career';
import type { CareerProfile, WorkExperience } from '@/_types/career';

type EditableWork = Omit<WorkExperience, 'id'>;

const toEditableWork = (work: WorkExperience): EditableWork => {
  const editable = { ...work };
  delete editable.id;
  return editable;
};

interface WorkSectionProps {
  profile: CareerProfile | null;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSaveSuccess: () => void;
  isEmpty: boolean;
}

export default function WorkSection({
  profile,
  isEditing,
  onEdit,
  onCancel,
  onSaveSuccess,
  isEmpty,
}: WorkSectionProps) {
  const saveMutation = useSaveCareerWorks();
  const [works, setWorks] = useState<EditableWork[]>([]);

  useEffect(() => {
    if (profile && profile.works.length > 0) {
      setWorks(profile.works.map(toEditableWork));
    } else {
      setWorks([]);
    }
  }, [profile]);

  const handleAdd = () => {
    setWorks([
      ...works,
      {
        start_date: '',
        end_date: null,
        is_current: false,
        company: '',
        position: '',
        employment_type: 'full_time',
        region: '',
      },
    ]);
  };

  const handleRemove = (index: number) => {
    setWorks(works.filter((_, i) => i !== index));
  };

  const handleChange = <K extends keyof EditableWork>(
    index: number,
    field: K,
    value: EditableWork[K],
  ) => {
    const updated = [...works];
    updated[index] = { ...updated[index], [field]: value };
    setWorks(updated);
  };

  const handleSubmit = async () => {
    try {
      await saveMutation.mutateAsync({ works });
      onSaveSuccess();
    } catch (error) {
      console.error('경력 저장 실패:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCancel = () => {
    if (profile && profile.works.length > 0) {
      setWorks(profile.works.map(toEditableWork));
    } else {
      setWorks([]);
    }
    onCancel();
  };

  if (isEditing) {
    return (
      <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
        <div className="space-y-4">
          {works.map((work, idx) => (
            <div key={idx} className="relative space-y-3 rounded-lg border border-gray-200 bg-white p-3">
              <button
                onClick={() => handleRemove(idx)}
                className="absolute right-2 top-2 text-gray-300 transition-colors hover:text-red-500"
              >
                <FiTrash2 size={14} />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">시작</label>
                  <input
                    type="text"
                    value={work.start_date}
                    onChange={(e) => handleChange(idx, 'start_date', e.target.value)}
                    placeholder="YYYY.MM"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">종료</label>
                  <input
                    type="text"
                    value={work.end_date || ''}
                    onChange={(e) => handleChange(idx, 'end_date', e.target.value || null)}
                    placeholder="YYYY.MM"
                    disabled={work.is_current}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={work.is_current}
                  onChange={(e) => handleChange(idx, 'is_current', e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-gray-600">현재 재직 중</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">회사</label>
                  <input
                    type="text"
                    value={work.company}
                    onChange={(e) => handleChange(idx, 'company', e.target.value)}
                    placeholder="회사명"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">직무</label>
                  <input
                    type="text"
                    value={work.position}
                    onChange={(e) => handleChange(idx, 'position', e.target.value)}
                    placeholder="백엔드 개발자"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">고용형태</label>
                <select
                  value={work.employment_type}
                  onChange={(e) =>
                    handleChange(idx, 'employment_type', e.target.value as EditableWork['employment_type'])
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                >
                  {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">지역</label>
                <input
                  type="text"
                  value={work.region}
                  onChange={(e) => handleChange(idx, 'region', e.target.value)}
                  placeholder="예: 전북 전주"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                />
              </div>
            </div>
          ))}

          <button
            onClick={handleAdd}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-500"
          >
            <FiPlus size={16} />
            경력 추가
          </button>
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

  const isSectionEmpty = isEmpty || !profile || profile.works.length === 0;
  const displayWorks = isSectionEmpty
    ? [
        {
          start_date: '2025.03',
          end_date: null,
          is_current: true,
          company: '(주)예시기업',
          position: '백엔드 개발자',
          employment_type: 'full_time' as const,
          region: '서울 강남',
        },
      ]
    : profile?.works || [];

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold tracking-widest text-gray-900">경  력</h3>
        <button
          onClick={onEdit}
          className="text-gray-300 transition-colors hover:text-gray-500"
          aria-label="경력 수정"
        >
          <FiEdit3 size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {displayWorks.map((work, idx) => (
          <div key={idx} className={`border-l-2 pl-3 ${isSectionEmpty ? 'border-gray-200' : 'border-gray-300'}`}>
            <div className={`text-[10px] ${isSectionEmpty ? 'text-gray-300' : 'text-gray-400'}`}>
              {work.start_date} - {work.is_current ? '재직 중' : work.end_date}
            </div>
            <div className={`mt-0.5 text-sm font-bold ${isSectionEmpty ? 'text-gray-300' : 'text-gray-800'}`}>
              {work.company}
            </div>
            <div className={`mt-0.5 text-xs ${isSectionEmpty ? 'text-gray-300' : 'text-gray-500'}`}>
              {work.position} · {EMPLOYMENT_TYPE_LABELS[work.employment_type]}
            </div>
            {work.region && (
              <div className={`mt-0.5 text-xs ${isSectionEmpty ? 'text-gray-300' : 'text-gray-400'}`}>
                {work.region}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
