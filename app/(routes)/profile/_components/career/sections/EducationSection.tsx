'use client';

import { useState, useEffect } from 'react';
import { FiEdit3, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useSaveCareerEducations } from '@/_lib/hooks/useCareer';
import type { CareerProfile, Education } from '@/_types/career';
import { DEGREE_LABELS, STATUS_LABELS } from '@/_types/career';

interface EducationSectionProps {
  profile: CareerProfile | null;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSaveSuccess: () => void;
  isEmpty: boolean;
}

export default function EducationSection({
  profile,
  isEditing,
  onEdit,
  onCancel,
  onSaveSuccess,
  isEmpty,
}: EducationSectionProps) {
  const saveMutation = useSaveCareerEducations();
  const [educations, setEducations] = useState<Omit<Education, 'id'>[]>([]);

  useEffect(() => {
    if (profile && profile.educations.length > 0) {
      setEducations(profile.educations.map(({ id, ...rest }) => rest));
    } else {
      setEducations([]);
    }
  }, [profile]);

  const handleAdd = () => {
    setEducations([
      ...educations,
      {
        start_date: '',
        end_date: null,
        is_current: false,
        school: '',
        major: '',
        degree: 'bachelor',
        status: 'enrolled',
        region: '',
      },
    ]);
  };

  const handleRemove = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof Omit<Education, 'id'>, value: any) => {
    const updated = [...educations];
    updated[index] = { ...updated[index], [field]: value };
    setEducations(updated);
  };

  const handleSubmit = async () => {
    try {
      await saveMutation.mutateAsync({ educations });
      onSaveSuccess();
    } catch (error) {
      console.error('학력 저장 실패:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCancel = () => {
    if (profile && profile.educations.length > 0) {
      setEducations(profile.educations.map(({ id, ...rest }) => rest));
    } else {
      setEducations([]);
    }
    onCancel();
  };

  if (isEditing) {
    return (
      <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
        <div className="space-y-4">
          {educations.map((edu, idx) => (
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
                    value={edu.start_date}
                    onChange={(e) => handleChange(idx, 'start_date', e.target.value)}
                    placeholder="YYYY.MM"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">종료</label>
                  <input
                    type="text"
                    value={edu.end_date || ''}
                    onChange={(e) => handleChange(idx, 'end_date', e.target.value || null)}
                    placeholder="YYYY.MM"
                    disabled={edu.is_current}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={edu.is_current}
                  onChange={(e) => handleChange(idx, 'is_current', e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-gray-600">현재 재학 중</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">학교</label>
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => handleChange(idx, 'school', e.target.value)}
                    placeholder="학교명"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">전공</label>
                  <input
                    type="text"
                    value={edu.major}
                    onChange={(e) => handleChange(idx, 'major', e.target.value)}
                    placeholder="전공"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">학위</label>
                  <select
                    value={edu.degree}
                    onChange={(e) => handleChange(idx, 'degree', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                  >
                    {Object.entries(DEGREE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">상태</label>
                  <select
                    value={edu.status}
                    onChange={(e) => handleChange(idx, 'status', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">지역</label>
                <input
                  type="text"
                  value={edu.region}
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
            학력 추가
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

  const isSectionEmpty = isEmpty || !profile || profile.educations.length === 0;
  const displayEducations = isSectionEmpty
    ? [
        {
          start_date: '2020.03',
          end_date: '2024.02',
          is_current: false,
          school: '전북대학교',
          major: '컴퓨터공학과',
          degree: 'bachelor' as const,
          status: 'graduated' as const,
          region: '전북 전주',
        },
      ]
    : profile?.educations || [];

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold tracking-widest text-gray-900">학  력</h3>
        <button
          onClick={onEdit}
          className="text-gray-300 transition-colors hover:text-gray-500"
          aria-label="학력 수정"
        >
          <FiEdit3 size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {displayEducations.map((edu, idx) => (
          <div key={idx} className={`border-l-2 pl-3 ${isSectionEmpty ? 'border-gray-200' : 'border-gray-300'}`}>
            <div className={`text-[10px] ${isSectionEmpty ? 'text-gray-300' : 'text-gray-400'}`}>
              {edu.start_date} - {edu.is_current ? '재학 중' : edu.end_date}
            </div>
            <div className={`mt-0.5 text-sm font-bold ${isSectionEmpty ? 'text-gray-300' : 'text-gray-800'}`}>
              {edu.school}
            </div>
            <div className={`mt-0.5 text-xs ${isSectionEmpty ? 'text-gray-300' : 'text-gray-500'}`}>
              {edu.major} · {DEGREE_LABELS[edu.degree]} · {STATUS_LABELS[edu.status]}
            </div>
            {edu.region && (
              <div className={`mt-0.5 text-xs ${isSectionEmpty ? 'text-gray-300' : 'text-gray-400'}`}>
                {edu.region}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
