'use client';

import type { CareerProfile } from '@/_types/career';

import ActivitySection from './sections/ActivitySection';
import CertificationSection from './sections/CertificationSection';
import ContactSection from './sections/ContactSection';
import EducationSection from './sections/EducationSection';
import MentorQnASection from './sections/MentorQnASection';
import SkillTagsSection from './sections/SkillTagsSection';
import WorkSection from './sections/WorkSection';

type EditingSection =
  | 'contact'
  | 'educations'
  | 'works'
  | 'skills'
  | 'certifications'
  | 'activities'
  | 'mentor-qna'
  | null;

interface ResumePreviewProps {
  profile: CareerProfile | null;
  editingSection: EditingSection;
  onEditSection: (section: EditingSection) => void;
  onCancelEdit: () => void;
  onSaveSuccess: (section: string) => void;
}

export default function ResumePreview({
  profile,
  editingSection,
  onEditSection,
  onCancelEdit,
  onSaveSuccess,
}: ResumePreviewProps) {
  const isEmpty = !profile || profile.id === 0;
  const isSectionBlocked = (section: Exclude<EditingSection, null>) =>
    Boolean(editingSection && editingSection !== section);
  const showMentorSection = Boolean(profile?.is_mentor);

  return (
    <div className="mx-auto max-w-2xl">
      <div className={`rounded-2xl border bg-white p-6 shadow-sm ${isEmpty ? 'border-gray-100' : 'border-gray-200'}`}>
        <div className="space-y-8">
          <ContactSection
            profile={profile}
            isEditing={editingSection === 'contact'}
            onEdit={() => onEditSection('contact')}
            onCancel={onCancelEdit}
            onSaveSuccess={() => onSaveSuccess('연락 정보')}
            isEmpty={isEmpty}
          />

          <div className="border-t border-gray-100" />

          <div className={isSectionBlocked('educations') ? 'pointer-events-none opacity-50' : ''}>
            <EducationSection
              profile={profile}
              isEditing={editingSection === 'educations'}
              onEdit={() => onEditSection('educations')}
              onCancel={onCancelEdit}
              onSaveSuccess={() => onSaveSuccess('학력')}
              isEmpty={isEmpty}
            />
          </div>

          <div className="border-t border-gray-100" />

          <div className={isSectionBlocked('works') ? 'pointer-events-none opacity-50' : ''}>
            <WorkSection
              profile={profile}
              isEditing={editingSection === 'works'}
              onEdit={() => onEditSection('works')}
              onCancel={onCancelEdit}
              onSaveSuccess={() => onSaveSuccess('경력')}
              isEmpty={isEmpty}
            />
          </div>

          <div className="border-t border-gray-100" />

          <div className={isSectionBlocked('skills') ? 'pointer-events-none opacity-50' : ''}>
            <SkillTagsSection
              profile={profile}
              isEditing={editingSection === 'skills'}
              onEdit={() => onEditSection('skills')}
              onCancel={onCancelEdit}
              onSaveSuccess={() => onSaveSuccess('직무 키워드')}
              isEmpty={isEmpty}
            />
          </div>

          {showMentorSection && (
            <>
              <div className="border-t border-gray-100" />
              <div className={isSectionBlocked('mentor-qna') ? 'pointer-events-none opacity-50' : ''}>
                <MentorQnASection
                  profile={profile}
                  isEditing={editingSection === 'mentor-qna'}
                  onEdit={() => onEditSection('mentor-qna')}
                  onCancel={onCancelEdit}
                  onSaveSuccess={() => onSaveSuccess('선배님 Q&A')}
                  isEmpty={isEmpty}
                />
              </div>
            </>
          )}

          <div className="border-t border-gray-100" />

          <div className={isSectionBlocked('certifications') ? 'pointer-events-none opacity-50' : ''}>
            <CertificationSection
              profile={profile}
              isEditing={editingSection === 'certifications'}
              onEdit={() => onEditSection('certifications')}
              onCancel={onCancelEdit}
              onSaveSuccess={() => onSaveSuccess('자격증')}
              isEmpty={isEmpty}
            />
          </div>

          <div className="border-t border-gray-100" />

          <div className={isSectionBlocked('activities') ? 'pointer-events-none opacity-50' : ''}>
            <ActivitySection
              profile={profile}
              isEditing={editingSection === 'activities'}
              onEdit={() => onEditSection('activities')}
              onCancel={onCancelEdit}
              onSaveSuccess={() => onSaveSuccess('대외활동')}
              isEmpty={isEmpty}
            />
          </div>

          {isEmpty && (
            <div className="mt-8 rounded-lg bg-blue-50 px-4 py-3 text-center">
              <p className="text-sm font-medium text-blue-900">아직 작성된 이력이 없어요</p>
              <p className="mt-1 text-xs text-blue-600">각 섹션 옆 ✎ 아이콘을 눌러 이력을 추가해보세요!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
