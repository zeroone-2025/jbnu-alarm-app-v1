'use client';

import { useState } from 'react';
import { useCareer } from '@/_lib/hooks/useCareer';
import LoadingSpinner from '@/_components/ui/LoadingSpinner';
import ResumePreview from './ResumePreview';

type EditingSection =
  | 'contact'
  | 'educations'
  | 'works'
  | 'skills'
  | 'certifications'
  | 'activities'
  | 'mentor-qna'
  | null;

interface CareerTabProps {
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function CareerTab({ onShowToast }: CareerTabProps) {
  const { data: careerProfile, isLoading, error } = useCareer();
  const [editingSection, setEditingSection] = useState<EditingSection>(null);

  const handleEditSection = (section: EditingSection) => {
    setEditingSection(section);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
  };

  const handleSaveSuccess = (section: string) => {
    setEditingSection(null);
    onShowToast?.(`${section}이 저장되었습니다.`, 'success');
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center px-5 text-center">
        <p className="text-sm text-gray-400">이력 정보를 불러오는 데 실패했습니다.</p>
        <p className="mt-1 text-xs text-gray-300">잠시 후 다시 시도해주세요.</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-6">
      <ResumePreview
        profile={careerProfile || null}
        editingSection={editingSection}
        onEditSection={handleEditSection}
        onCancelEdit={handleCancelEdit}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}
