'use client';

import FullPageModal from '@/_components/layout/FullPageModal';
import { useToast } from '@/_context/ToastContext';
import type { CareerProfile } from '@/_types/career';
import type { UserProfile } from '@/_types/user';
import ContactForm from './forms/ContactForm';
import LanguageScoreForm from './forms/LanguageScoreForm';
import CertificationForm from './forms/CertificationForm';
import SkillTagsForm from './forms/SkillTagsForm';
import EducationForm from './forms/EducationForm';
import WorkForm from './forms/WorkForm';
import ActivityForm from './forms/ActivityForm';
import MentorQnAForm from './forms/MentorQnAForm';
import ProfileEditForm from './forms/ProfileEditForm';

export type EditSection =
  | 'profile'
  | 'contact'
  | 'language_scores'
  | 'certifications'
  | 'skills'
  | 'educations'
  | 'works'
  | 'experiences'
  | 'awards'
  | 'mentor_qna'
  | null;

const TITLES: Record<Exclude<EditSection, null>, string> = {
  profile: '프로필',
  contact: '연락 정보',
  language_scores: '어학',
  certifications: '자격증',
  skills: '직무 키워드',
  educations: '학력',
  works: '경력',
  experiences: '경험',
  awards: '수상',
  mentor_qna: '선배님 Q&A',
};

interface Props {
  section: EditSection;
  profile: CareerProfile | null;
  user: UserProfile | null;
  onClose: () => void;
}

export default function EditSheet({ section, profile, user, onClose }: Props) {
  const { showToast } = useToast();
  const isOpen = section !== null;

  const handleSuccess = (label: string) => {
    showToast(`${label} 저장 완료`, 'success');
    onClose();
  };
  const handleError = (msg: string) => showToast(msg, 'error');

  let body: React.ReactNode = null;
  if (section) {
    const label = TITLES[section];
    const successCb = () => handleSuccess(label);

    switch (section) {
      case 'profile':
        body = (
          <ProfileEditForm
            user={user}
            onClose={onClose}
            onSaveSuccess={successCb}
            onError={handleError}
          />
        );
        break;
      case 'contact':
        body = (
          <ContactForm
            profile={profile}
            onClose={onClose}
            onSaveSuccess={successCb}
            onError={handleError}
          />
        );
        break;
      case 'language_scores':
        body = (
          <LanguageScoreForm
            scores={profile?.language_scores ?? []}
            onClose={onClose}
            onSaveSuccess={successCb}
            onError={handleError}
          />
        );
        break;
      case 'certifications':
        body = (
          <CertificationForm
            certifications={profile?.certifications ?? []}
            onClose={onClose}
            onSaveSuccess={successCb}
            onError={handleError}
          />
        );
        break;
      case 'skills':
        body = (
          <SkillTagsForm
            tags={profile?.skill_tags ?? []}
            onClose={onClose}
            onSaveSuccess={successCb}
            onError={handleError}
          />
        );
        break;
      case 'educations':
        body = (
          <EducationForm
            educations={profile?.educations ?? []}
            onClose={onClose}
            onSaveSuccess={successCb}
            onError={handleError}
          />
        );
        break;
      case 'works':
        body = (
          <WorkForm
            works={profile?.works ?? []}
            onClose={onClose}
            onSaveSuccess={successCb}
            onError={handleError}
          />
        );
        break;
      case 'experiences':
        body = (
          <ActivityForm
            kind="experience"
            allActivities={profile?.activities ?? []}
            onClose={onClose}
            onSaveSuccess={successCb}
            onError={handleError}
          />
        );
        break;
      case 'awards':
        body = (
          <ActivityForm
            kind="award"
            allActivities={profile?.activities ?? []}
            onClose={onClose}
            onSaveSuccess={successCb}
            onError={handleError}
          />
        );
        break;
      case 'mentor_qna':
        body = (
          <MentorQnAForm
            qna={profile?.mentor_qna ?? null}
            onClose={onClose}
            onSaveSuccess={successCb}
            onError={handleError}
          />
        );
        break;
    }
  }

  return (
    <FullPageModal
      isOpen={isOpen}
      onClose={onClose}
      title={section ? TITLES[section] : ''}
      mode="inline"
    >
      {body}
    </FullPageModal>
  );
}
