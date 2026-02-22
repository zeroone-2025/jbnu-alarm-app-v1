'use client';

import { useEffect, useState } from 'react';

import { FiEdit3, FiPlus, FiTrash2 } from 'react-icons/fi';

import { useSaveCareerActivities } from '@/_lib/hooks/useCareer';
import type { CareerProfile, Activity } from '@/_types/career';

type EditableActivity = Omit<Activity, 'id'>;

const toEditableActivity = (activity: Activity): EditableActivity => {
  const editable = { ...activity };
  delete editable.id;
  return editable;
};

interface ActivitySectionProps {
  profile: CareerProfile | null;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSaveSuccess: () => void;
  isEmpty: boolean;
}

export default function ActivitySection({
  profile,
  isEditing,
  onEdit,
  onCancel,
  onSaveSuccess,
  isEmpty,
}: ActivitySectionProps) {
  const saveMutation = useSaveCareerActivities();
  const [activities, setActivities] = useState<EditableActivity[]>([]);

  useEffect(() => {
    if (profile && profile.activities.length > 0) {
      setActivities(profile.activities.map(toEditableActivity));
    } else {
      setActivities([]);
    }
  }, [profile]);

  const handleAdd = () => {
    setActivities([
      ...activities,
      {
        name: '',
        period: null,
        description: null,
      },
    ]);
  };

  const handleRemove = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const handleChange = <K extends keyof EditableActivity>(
    index: number,
    field: K,
    value: EditableActivity[K],
  ) => {
    const updated = [...activities];
    updated[index] = { ...updated[index], [field]: value };
    setActivities(updated);
  };

  const handleSubmit = async () => {
    try {
      await saveMutation.mutateAsync({ activities });
      onSaveSuccess();
    } catch (error) {
      console.error('대외활동 저장 실패:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCancel = () => {
    if (profile && profile.activities.length > 0) {
      setActivities(profile.activities.map(toEditableActivity));
    } else {
      setActivities([]);
    }
    onCancel();
  };

  if (isEditing) {
    return (
      <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
        <div className="space-y-4">
          {activities.map((activity, idx) => (
            <div key={idx} className="relative space-y-3 rounded-lg border border-gray-200 bg-white p-3">
              <button
                onClick={() => handleRemove(idx)}
                className="absolute right-2 top-2 text-gray-300 transition-colors hover:text-red-500"
              >
                <FiTrash2 size={14} />
              </button>

              <div className="grid grid-cols-[1fr_120px] gap-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">활동명</label>
                  <input
                    type="text"
                    value={activity.name}
                    onChange={(e) => handleChange(idx, 'name', e.target.value)}
                    placeholder="공모전/대외활동명"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">기간</label>
                  <input
                    type="text"
                    value={activity.period || ''}
                    onChange={(e) => handleChange(idx, 'period', e.target.value || null)}
                    placeholder="2025.03-2026.02"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">설명 (선택)</label>
                <textarea
                  value={activity.description || ''}
                  onChange={(e) => handleChange(idx, 'description', e.target.value || null)}
                  placeholder="활동 내용을 간단히 입력하세요"
                  rows={2}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                />
              </div>
            </div>
          ))}

          <button
            onClick={handleAdd}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-500"
          >
            <FiPlus size={16} />
            대외활동 추가
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

  const isSectionEmpty = isEmpty || !profile || profile.activities.length === 0;
  const displayActivities = isSectionEmpty
    ? [
        {
          name: '창업 경진대회',
          period: '2025.03-2026.02',
          description: '팀 프로젝트로 참여하여 우수상 수상',
        },
      ]
    : profile?.activities || [];

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold tracking-widest text-gray-900">공모전 / 대외활동</h3>
        <button
          onClick={onEdit}
          className="text-gray-300 transition-colors hover:text-gray-500"
          aria-label="대외활동 수정"
        >
          <FiEdit3 size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {displayActivities.map((activity, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-bold ${isSectionEmpty ? 'text-gray-300' : 'text-gray-800'}`}>
                {activity.name}
              </span>
              {activity.period && (
                <span className={`text-xs ${isSectionEmpty ? 'text-gray-300' : 'text-gray-400'}`}>
                  {activity.period}
                </span>
              )}
            </div>
            {activity.description && (
              <p className={`mt-1 text-xs ${isSectionEmpty ? 'text-gray-300' : 'text-gray-500'}`}>
                {activity.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
