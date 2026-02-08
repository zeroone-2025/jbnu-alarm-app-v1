'use client';

import { useState, useEffect } from 'react';
import { FiEdit3, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useSaveCareerCertifications } from '@/_lib/hooks/useCareer';
import type { CareerProfile, Certification } from '@/_types/career';

interface CertificationSectionProps {
  profile: CareerProfile | null;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSaveSuccess: () => void;
  isEmpty: boolean;
}

export default function CertificationSection({
  profile,
  isEditing,
  onEdit,
  onCancel,
  onSaveSuccess,
  isEmpty,
}: CertificationSectionProps) {
  const saveMutation = useSaveCareerCertifications();
  const [certifications, setCertifications] = useState<Omit<Certification, 'id'>[]>([]);

  useEffect(() => {
    if (profile && profile.certifications.length > 0) {
      setCertifications(profile.certifications.map(({ id, ...rest }) => rest));
    } else {
      setCertifications([]);
    }
  }, [profile]);

  const handleAdd = () => {
    setCertifications([
      ...certifications,
      {
        name: '',
        date: null,
      },
    ]);
  };

  const handleRemove = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof Omit<Certification, 'id'>, value: any) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };

  const handleSubmit = async () => {
    try {
      await saveMutation.mutateAsync({ certifications });
      onSaveSuccess();
    } catch (error) {
      console.error('자격증 저장 실패:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCancel = () => {
    if (profile && profile.certifications.length > 0) {
      setCertifications(profile.certifications.map(({ id, ...rest }) => rest));
    } else {
      setCertifications([]);
    }
    onCancel();
  };

  if (isEditing) {
    return (
      <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
        <div className="space-y-3">
          {certifications.map((cert, idx) => (
            <div key={idx} className="relative grid grid-cols-[1fr_120px_20px] items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
              <input
                type="text"
                value={cert.name}
                onChange={(e) => handleChange(idx, 'name', e.target.value)}
                placeholder="자격증명"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
              <input
                type="text"
                value={cert.date || ''}
                onChange={(e) => handleChange(idx, 'date', e.target.value || null)}
                placeholder="YYYY.MM"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
              <button
                onClick={() => handleRemove(idx)}
                className="text-gray-300 transition-colors hover:text-red-500"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}

          <button
            onClick={handleAdd}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-500"
          >
            <FiPlus size={16} />
            자격증 추가
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

  const isSectionEmpty = isEmpty || !profile || profile.certifications.length === 0;
  const displayCerts = isSectionEmpty
    ? [
        { name: 'TOEIC 900점', date: '2023.06' },
        { name: '정보처리기사', date: '2023.09' },
      ]
    : profile?.certifications || [];

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold tracking-widest text-gray-900">자격증</h3>
        <button
          onClick={onEdit}
          className="text-gray-300 transition-colors hover:text-gray-500"
          aria-label="자격증 수정"
        >
          <FiEdit3 size={16} />
        </button>
      </div>

      <ul className="space-y-2">
        {displayCerts.map((cert, idx) => (
          <li key={idx} className={`flex items-center text-sm ${isSectionEmpty ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="mr-2">•</span>
            <span>{cert.name}</span>
            {cert.date && (
              <span className={`ml-auto text-xs ${isSectionEmpty ? 'text-gray-300' : 'text-gray-400'}`}>
                {cert.date}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
