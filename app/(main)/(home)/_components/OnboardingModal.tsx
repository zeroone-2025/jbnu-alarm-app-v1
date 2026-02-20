'use client';

import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MAJOR_PRESETS } from '@/_lib/constants/presets';
import { GUEST_DEFAULT_BOARDS } from '@/_lib/constants/boards';
import {
  completeOnboarding,
  saveCareerContact,
  saveCareerEducations,
  saveCareerMentorQnA,
  saveCareerSkills,
  saveCareerWorks,
} from '@/_lib/api';
import { savePendingOnboarding, loadPendingOnboarding } from '@/_lib/onboarding/pendingSubmission';
import UserInfoForm, { UserInfoFormData } from '@/_components/auth/UserInfoForm';
import FullPageModal from '@/_components/layout/FullPageModal';
import Logo from '@/_components/ui/Logo';
import { useUserStore } from '@/_lib/store/useUserStore';
import { FiCalendar, FiCheck } from 'react-icons/fi';
import type { OnboardingRequest } from '@/_types/user';
import type {
  CareerContactUpdate,
  CareerEducationsUpdate,
  CareerMentorQnAUpdate,
  CareerSkillsUpdate,
  CareerWorksUpdate,
  Education,
  MentorQnA,
  WorkExperience,
} from '@/_types/career';
import type { PendingOnboardingSubmission } from '@/_lib/onboarding/pendingSubmission';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (categories: string[]) => void | Promise<void>;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  isLoggedIn?: boolean;
  onRequireLogin?: (pendingData: PendingOnboardingSubmission) => void;
  onMentorCompleted?: () => void;
}

type UserType = 'student' | 'mentor';
type VisibilityType = 'public' | 'career_only';
type EducationDegreeType = Education['degree'];
type EducationStatusType = Education['status'];
type MentorStepKey =
  | 'basic'
  | 'contact'
  | 'skills'
  | 'works'
  | 'mentor-qna'
  | 'review';

interface MentorStep {
  key: MentorStepKey;
  title: string;
  description: string;
  optional?: boolean;
}

const MENTOR_STEPS: MentorStep[] = [
  {
    key: 'basic',
    title: '학력 정보',
    description: '학력 정보를 입력해 주세요',
  },
  {
    key: 'contact',
    title: '연락 정보',
    description: '연락처와 공개 범위를 설정해 주세요',
  },
  {
    key: 'skills',
    title: '직무 키워드',
    description: '경험한 직무 키워드를 입력해 주세요',
  },
  {
    key: 'works',
    title: '경력',
    description: '회사와 직무 경험을 입력해 주세요',
  },
  {
    key: 'mentor-qna',
    title: '멘토 Q&A',
    description: '후배들을 위한 조언을 남겨 주세요',
  },
  {
    key: 'review',
    title: '최종 확인',
    description: '입력한 내용을 확인하고 완료해 주세요',
  },
];
const MENTOR_QNA_STEP_INDEX = MENTOR_STEPS.findIndex((step) => step.key === 'mentor-qna');

const EMPLOYMENT_OPTIONS: WorkExperience['employment_type'][] = [
  'full_time',
  'contract',
  'intern',
  'freelance',
  'part_time',
];
const EMPLOYMENT_LABELS: Record<WorkExperience['employment_type'], string> = {
  full_time: '정규직',
  contract: '계약직',
  intern: '인턴',
  freelance: '프리랜서',
  part_time: '파트타임',
};
const EDUCATION_DEGREE_OPTIONS: EducationDegreeType[] = ['associate', 'bachelor', 'master', 'doctor'];
const EDUCATION_DEGREE_LABELS: Record<EducationDegreeType, string> = {
  associate: '전문학사',
  bachelor: '학사',
  master: '석사',
  doctor: '박사',
};
const EDUCATION_STATUS_OPTIONS: EducationStatusType[] = ['enrolled', 'leave', 'graduated', 'completed'];
const EDUCATION_STATUS_LABELS: Record<EducationStatusType, string> = {
  enrolled: '재학',
  leave: '휴학',
  graduated: '졸업',
  completed: '수료',
};
const GRADUATION_REQUIRED_STATUSES: EducationStatusType[] = ['graduated', 'completed'];

const YEAR_REGEX = /^\d{4}$/;
const GRADUATION_YEAR_OPTIONS = Array.from({ length: 47 }, (_, i) => (2026 - i).toString());

const createEmptyWork = (isCurrent = false): Omit<WorkExperience, 'id'> => ({
  start_date: '',
  end_date: null,
  is_current: isCurrent,
  company: '',
  position: '',
  employment_type: 'full_time',
  region: '',
});

const createEmptyMentorQna = (): MentorQnA => ({
  targeted_capital: null,
  reason_for_local: null,
  helpful_organizations: null,
  local_advantages: null,
  local_disadvantages: null,
  advice_for_juniors: null,
});

const toNullable = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const getCurrentYearMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`;
};

function RequirementBadge() {
  return (
    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">선택</span>
  );
}

export default function OnboardingModal({
  isOpen,
  onComplete,
  onShowToast,
  isLoggedIn = true,
  onRequireLogin,
  onMentorCompleted,
}: OnboardingModalProps) {
  const queryClient = useQueryClient();
  const setUser = useUserStore((state) => state.setUser);
  const currentUser = useUserStore((state) => state.user);

  const [step, setStep] = useState<1 | 2>(1);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [formData, setFormData] = useState<UserInfoFormData>({
    nickname: '',
    school: '전북대',
    dept_code: '',
    dept_name: '',
    admission_year: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [mentorStepIndex, setMentorStepIndex] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [contactData, setContactData] = useState<{
    phone: string;
    visibility: VisibilityType;
  }>({
    phone: '',
    visibility: 'public',
  });
  const [skillInput, setSkillInput] = useState<string>('');
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [works, setWorks] = useState<Omit<WorkExperience, 'id'>[]>([createEmptyWork(false)]);
  const [educationDegree, setEducationDegree] = useState<EducationDegreeType | ''>('');
  const [educationStatus, setEducationStatus] = useState<EducationStatusType | ''>('');
  const [graduationYear, setGraduationYear] = useState<string>('');
  const [mentorQna, setMentorQna] = useState<MentorQnA>(createEmptyMentorQna());
  const [mentorQnaSubStep, setMentorQnaSubStep] = useState<1 | 2>(1);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [mentorCompleted, setMentorCompleted] = useState<string[] | null>(null);
  const didRestoreRef = useRef(false);

  const isGraduationYearRequired = educationStatus !== '' && GRADUATION_REQUIRED_STATUSES.includes(educationStatus);
  const availableGraduationYearOptions = GRADUATION_YEAR_OPTIONS;

  // localStorage에 저장된 pending 데이터가 있으면 폼 복원
  useEffect(() => {
    if (didRestoreRef.current) return;
    didRestoreRef.current = true;

    const pending = loadPendingOnboarding();
    if (!pending) return;

    const { onboarding, mentorCareer } = pending;
    setUserType(onboarding.user_type as UserType);
    setFormData((prev) => ({
      ...prev,
      school: onboarding.school || '전북대',
      dept_code: onboarding.dept_code || '',
      admission_year: onboarding.admission_year != null ? String(onboarding.admission_year) : '',
    }));
    setStep(2);

    if (onboarding.user_type === 'mentor' && mentorCareer) {
      setContactData({
        phone: mentorCareer.contact.phone || '',
        visibility: (mentorCareer.contact.visibility as VisibilityType) || 'public',
      });
      setSkillTags(mentorCareer.skills.skill_tags || []);
      if (mentorCareer.works.works.length > 0) {
        setWorks(mentorCareer.works.works);
      }
      if (mentorCareer.educations.educations.length > 0) {
        const edu = mentorCareer.educations.educations[0];
        if (edu.end_date) setGraduationYear(edu.end_date);
      }
      setMentorQna(mentorCareer.mentor_qna.mentor_qna);
      // 최종 확인 단계로 이동
      setMentorStepIndex(MENTOR_STEPS.length - 1);
    }
  }, []);

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    if (type === 'mentor') {
      setMentorStepIndex(0);
      setMentorQnaSubStep(1);
      setSlideDirection(1);
    }
  };

  const handleNext = () => {
    if (!userType) return;
    setStep(2);
  };

  const buildStudentBoardCodes = () => {
    let boardCodes: string[] = [...GUEST_DEFAULT_BOARDS];
    if (formData.dept_code) {
      const preset = MAJOR_PRESETS.find(
        (p) => p.label === formData.dept_name || p.id === formData.dept_code.replace('dept_', ''),
      );
      if (preset) {
        boardCodes = preset.categories;
      } else {
        boardCodes.push(formData.dept_code);
      }
    }
    return boardCodes;
  };

  const requestLoginForPendingSave = (pendingData: PendingOnboardingSubmission) => {
    savePendingOnboarding(pendingData);
    onShowToast?.('로그인 후 저장을 완료해 주세요.', 'info');
    onRequireLogin?.(pendingData);
  };

  const handleSubmit = async () => {
    if (!userType) return;
    if (userType === 'student') {
      if (!formData.school.trim()) {
        alert('학교를 입력해 주세요.');
        return;
      }
      if (!formData.dept_code.trim()) {
        alert('학과를 선택해 주세요.');
        return;
      }
      if (!formData.admission_year.trim()) {
        alert('학번을 선택해 주세요.');
        return;
      }
      if (!/^\d{2}$/.test(formData.admission_year.trim())) {
        alert('학번은 2자리 숫자로 입력해 주세요. (예: 21)');
        return;
      }
    }

    const boardCodes = buildStudentBoardCodes();
    const onboardingPayload: OnboardingRequest = {
      user_type: userType,
      school: formData.school || '전북대',
      dept_code: formData.dept_code || undefined,
      admission_year: formData.admission_year ? parseInt(formData.admission_year, 10) : undefined,
      board_codes: boardCodes,
    };

    if (!isLoggedIn) {
      requestLoginForPendingSave({ onboarding: onboardingPayload });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await completeOnboarding(onboardingPayload);

      queryClient.setQueryData(['user', 'profile'], result.user);
      setUser(result.user);
      localStorage.setItem('my_subscribed_categories', JSON.stringify(result.subscribed_boards));
      onShowToast?.('제로타임에 오신 것을 환영합니다! 🎉', 'success');
      await onComplete(result.subscribed_boards);
    } catch (error) {
      console.error('온보딩 처리 실패:', error);
      alert('정보 저장에 실패했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!userType) return;

    const confirmMessage =
      userType === 'student'
        ? '학과 정보를 입력하지 않고 시작할까요?\n나중에 설정에서 언제든지 변경할 수 있습니다.'
        : '학교 정보 없이 시작할까요?\n나중에 설정에서 언제든지 변경할 수 있습니다.';
    if (!confirm(confirmMessage)) return;

    const onboardingPayload: OnboardingRequest = {
      user_type: userType,
      school: '전북대',
      board_codes: [...GUEST_DEFAULT_BOARDS],
    };

    if (!isLoggedIn) {
      requestLoginForPendingSave({ onboarding: onboardingPayload });
      return;
    }

    setIsSubmitting(true);
    try {
      const defaultBoards = onboardingPayload.board_codes;
      const result = await completeOnboarding(onboardingPayload);

      queryClient.setQueryData(['user', 'profile'], result.user);
      setUser(result.user);
      localStorage.setItem('my_subscribed_categories', JSON.stringify(defaultBoards));
      onShowToast?.('제로타임에 오신 것을 환영합니다! 🎉', 'success');
      await onComplete(defaultBoards);
    } catch (error) {
      console.error('건너뛰기 실패:', error);
      onShowToast?.('저장에 실패했습니다. 다시 시도해주세요.', 'error');
      setIsSubmitting(false);
    }
  };

  const clearInvalidField = (fieldKey: string) => {
    setInvalidFields((prev) => {
      if (!prev.has(fieldKey)) return prev;
      const next = new Set(prev);
      next.delete(fieldKey);
      return next;
    });
  };
  const hasInvalidField = (fieldKey: string) => invalidFields.has(fieldKey);

  const currentMentorStep = MENTOR_STEPS[mentorStepIndex];
  const totalMentorScreens = MENTOR_STEPS.length + 1; // 멘토 Q&A를 2페이지로 분리
  const currentMentorScreen = (() => {
    let current = mentorStepIndex + 1;
    if (mentorStepIndex > MENTOR_QNA_STEP_INDEX) current += 1;
    if (mentorStepIndex === MENTOR_QNA_STEP_INDEX && mentorQnaSubStep === 2) current += 1;
    return current;
  })();
  const mentorProgress = (currentMentorScreen / totalMentorScreens) * 100;
  const mentorStepTitle =
    currentMentorStep?.key === 'mentor-qna' ? `멘토 Q&A (${mentorQnaSubStep}/2)` : currentMentorStep?.title || '';
  const mentorStepDescription =
    currentMentorStep?.key === 'mentor-qna'
      ? mentorQnaSubStep === 1
        ? '경험과 배경 관련 질문에 답변해 주세요'
        : '인사이트와 조언 관련 질문에 답변해 주세요'
      : currentMentorStep?.description || '';
  const isStudentSubmitDisabled =
    isSubmitting ||
    !formData.school.trim() ||
    !formData.dept_code.trim() ||
    !formData.admission_year.trim() ||
    !/^\d{2}$/.test(formData.admission_year.trim());

  const hasAnyWorkInput = (work: Omit<WorkExperience, 'id'>) =>
    Boolean(work.company.trim() || work.position.trim() || work.region || work.is_current);

  const getMentorMissingFields = (): string[] => {
    if (!currentMentorStep) return [];
    const missing: string[] = [];

    if (currentMentorStep.key === 'basic') {
      if (!formData.school.trim()) missing.push('basic_school');
      if (!formData.dept_code.trim()) missing.push('basic_dept');
      if (!formData.admission_year.trim()) missing.push('basic_admission_year');
      if (!graduationYear.trim()) missing.push('basic_graduation_year');
    }

    if (currentMentorStep.key === 'contact') {
      // name, email은 currentUser에서 자동으로 가져옴
    }

    if (currentMentorStep.key === 'skills' && skillTags.length === 0) {
      missing.push('skills_tags');
    }

    if (currentMentorStep.key === 'works') {
      const hasAtLeastOneWork = works.some((work) => hasAnyWorkInput(work));
      if (!hasAtLeastOneWork) {
        missing.push('works_0_company');
        missing.push('works_0_position');
        return missing;
      }

      for (let i = 0; i < works.length; i += 1) {
        const work = works[i];
        if (!hasAnyWorkInput(work)) continue;
        if (!work.company.trim()) missing.push(`works_${i}_company`);
        if (!work.position.trim()) missing.push(`works_${i}_position`);
      }
    }

    if (currentMentorStep.key === 'mentor-qna') {
      if (mentorQnaSubStep === 1) {
        if (mentorQna.targeted_capital === null) missing.push('mentor_qna_targeted_capital');
        if (!toNullable(mentorQna.reason_for_local || '')) missing.push('mentor_qna_reason_for_local');
        if (!toNullable(mentorQna.helpful_organizations || '')) missing.push('mentor_qna_helpful_organizations');
      } else {
        if (!toNullable(mentorQna.local_advantages || '')) missing.push('mentor_qna_local_advantages');
        if (!toNullable(mentorQna.local_disadvantages || '')) missing.push('mentor_qna_local_disadvantages');
      }
    }

    return missing;
  };

  const validateMentorStepFormat = (): string | null => {
    if (!currentMentorStep) return null;

    if (currentMentorStep.key === 'basic') {
      if (formData.admission_year.trim() && !/^\d{2}$/.test(formData.admission_year.trim())) {
        return '학번은 2자리 숫자로 입력해 주세요. (예: 21)';
      }
      if (graduationYear.trim() && !YEAR_REGEX.test(graduationYear.trim())) {
        return '졸업년도는 YYYY 형식으로 입력해 주세요. (예: 2024)';
      }
    }

    if (currentMentorStep.key === 'contact') {
      // email은 currentUser에서 자동으로 가져옴
    }

    if (currentMentorStep.key === 'works') {
      // company, position만 검증 (시작/종료 날짜 없음)
    }

    return null;
  };

  const handleAddSkillTag = () => {
    const newTag = skillInput.trim();
    if (!newTag) return;
    if (skillTags.includes(newTag)) {
      setSkillInput('');
      return;
    }
    setSkillTags((prev) => [...prev, newTag]);
    clearInvalidField('skills_tags');
    setSkillInput('');
  };

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleAddSkillTag();
    }
  };

  const goToMentorStep = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= MENTOR_STEPS.length) return;
    setSlideDirection(nextIndex > mentorStepIndex ? 1 : -1);
    setInvalidFields(new Set());
    if (nextIndex === MENTOR_QNA_STEP_INDEX && mentorStepIndex < MENTOR_QNA_STEP_INDEX) {
      setMentorQnaSubStep(1);
    }
    setMentorStepIndex(nextIndex);
  };

  const handleMentorNext = () => {
    const missingFields = getMentorMissingFields();
    if (missingFields.length > 0) {
      setInvalidFields(new Set(missingFields));
      onShowToast?.('아직 미입력된 정보가 있습니다.', 'error');
      return;
    }

    const validationMessage = validateMentorStepFormat();
    if (validationMessage) {
      onShowToast?.(validationMessage, 'error');
      return;
    }

    setInvalidFields(new Set());
    if (currentMentorStep?.key === 'mentor-qna' && mentorQnaSubStep === 1) {
      setSlideDirection(1);
      setMentorQnaSubStep(2);
      return;
    }

    if (mentorStepIndex < MENTOR_STEPS.length - 1) {
      goToMentorStep(mentorStepIndex + 1);
    }
  };

  const handleMentorPrev = () => {
    if (currentMentorStep?.key === 'mentor-qna' && mentorQnaSubStep === 2) {
      setSlideDirection(-1);
      setInvalidFields(new Set());
      setMentorQnaSubStep(1);
      return;
    }
    if (mentorStepIndex === MENTOR_QNA_STEP_INDEX + 1) {
      setMentorQnaSubStep(2);
    }
    goToMentorStep(mentorStepIndex - 1);
  };

  const normalizeWorks: Omit<WorkExperience, 'id'>[] = works
    .filter(hasAnyWorkInput)
    .map((work) => ({
      ...work,
      company: work.company.trim(),
      position: work.position.trim(),
      start_date: work.start_date.trim() || getCurrentYearMonth(),
      end_date: null,
      region: (work.region || '').trim(),
    }));

  const normalizeEducations: Omit<Education, 'id'>[] =
    formData.dept_code.trim() && formData.admission_year.trim() && educationDegree && educationStatus
      ? [
          {
            start_date: `20${formData.admission_year.trim()}`,
            end_date: graduationYear.trim() || null,
            is_current: false,
            school: (formData.school === '전북대' ? '전북대학교' : formData.school).trim(),
            major: (formData.dept_name || formData.dept_code).trim(),
            degree: educationDegree,
            status: educationStatus,
            region: '',
          },
        ]
      : [];

  const normalizedContact: CareerContactUpdate = {
    name: toNullable(currentUser?.nickname || ''),
    email: toNullable(currentUser?.email || ''),
    phone: toNullable(contactData.phone),
    visibility: contactData.visibility,
  };
  const normalizedSkills: CareerSkillsUpdate = { skill_tags: skillTags };
  const normalizedWorksUpdate: CareerWorksUpdate = { works: normalizeWorks };
  const normalizedEducationsUpdate: CareerEducationsUpdate = { educations: normalizeEducations };
  const normalizedMentorQna: CareerMentorQnAUpdate = {
    mentor_qna: {
      targeted_capital: mentorQna.targeted_capital,
      reason_for_local: toNullable(mentorQna.reason_for_local || ''),
      helpful_organizations: toNullable(mentorQna.helpful_organizations || ''),
      local_advantages: toNullable(mentorQna.local_advantages || ''),
      local_disadvantages: toNullable(mentorQna.local_disadvantages || ''),
      advice_for_juniors: toNullable(mentorQna.advice_for_juniors || ''),
    },
  };

  const handleMentorComplete = async () => {
    if (userType !== 'mentor') return;
    const missingFields = getMentorMissingFields();
    if (missingFields.length > 0) {
      setInvalidFields(new Set(missingFields));
      onShowToast?.('아직 미입력된 정보가 있습니다.', 'error');
      return;
    }

    const validationMessage = validateMentorStepFormat();
    if (validationMessage) {
      onShowToast?.(validationMessage, 'error');
      return;
    }

    const onboardingPayload: OnboardingRequest = {
      user_type: userType,
      school: formData.school || '전북대',
      dept_code: formData.dept_code || undefined,
      admission_year: formData.admission_year ? parseInt(formData.admission_year, 10) : undefined,
      board_codes: [...GUEST_DEFAULT_BOARDS],
    };

    if (!isLoggedIn) {
      requestLoginForPendingSave({
        onboarding: onboardingPayload,
        mentorCareer: {
          contact: normalizedContact,
          skills: normalizedSkills,
          works: normalizedWorksUpdate,
          educations: normalizedEducationsUpdate,
          mentor_qna: normalizedMentorQna,
        },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const onboardingResult = await completeOnboarding(onboardingPayload);

      await saveCareerContact(normalizedContact);
      await saveCareerSkills(normalizedSkills);
      await saveCareerWorks(normalizedWorksUpdate);
      await saveCareerEducations(normalizedEducationsUpdate);
      await saveCareerMentorQnA(normalizedMentorQna);

      queryClient.setQueryData(['user', 'profile'], onboardingResult.user);
      setUser(onboardingResult.user);
      localStorage.setItem('my_subscribed_categories', JSON.stringify(onboardingResult.subscribed_boards));
      onMentorCompleted?.();
      setMentorCompleted(onboardingResult.subscribed_boards);
    } catch (error) {
      console.error('멘토 온보딩 처리 실패:', error);
      alert('저장 중 문제가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMentorStepContent = () => {
    if (!currentMentorStep) return null;

    switch (currentMentorStep.key) {
      case 'basic':
        return (
          <div className="space-y-4">
            <UserInfoForm
              formData={formData}
              onChange={(data) => {
                setFormData((prev: UserInfoFormData) => ({ ...prev, ...data }));
                if (Object.prototype.hasOwnProperty.call(data, 'school')) clearInvalidField('basic_school');
                if (Object.prototype.hasOwnProperty.call(data, 'dept_code')) clearInvalidField('basic_dept');
                if (Object.prototype.hasOwnProperty.call(data, 'admission_year')) {
                  clearInvalidField('basic_admission_year');
                  const nextAdmissionRaw = String(data.admission_year || '').trim();
                  const nextAdmissionFull = /^\d{2}$/.test(nextAdmissionRaw) ? Number(`20${nextAdmissionRaw}`) : null;
                  if (nextAdmissionFull && graduationYear && Number(graduationYear) < nextAdmissionFull) {
                    setGraduationYear('');
                    clearInvalidField('basic_graduation_year');
                  }
                }
              }}
              showNickname={false}
              isReadonlySchool={false}
              invalidFields={{
                school: hasInvalidField('basic_school'),
                dept_code: hasInvalidField('basic_dept'),
                admission_year: hasInvalidField('basic_admission_year'),
              }}
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">학위</label>
                <select
                  value={educationDegree}
                  onChange={(e) => {
                    setEducationDegree(e.target.value as EducationDegreeType | '');
                    clearInvalidField('basic_degree');
                  }}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                    hasInvalidField('basic_degree')
                      ? 'border-red-300 bg-red-50 focus:border-red-500'
                      : 'border-gray-200 bg-gray-50 focus:border-gray-900 focus:bg-white'
                  }`}
                >
                  <option value="">선택</option>
                  {EDUCATION_DEGREE_OPTIONS.map((degree) => (
                    <option key={degree} value={degree}>
                      {EDUCATION_DEGREE_LABELS[degree]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">상태</label>
                <select
                  value={educationStatus}
                  onChange={(e) => {
                    const nextStatus = e.target.value as EducationStatusType | '';
                    setEducationStatus(nextStatus);
                    clearInvalidField('basic_status');
                    if (!nextStatus || !GRADUATION_REQUIRED_STATUSES.includes(nextStatus)) {
                      setGraduationYear('');
                      clearInvalidField('basic_graduation_year');
                    }
                  }}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                    hasInvalidField('basic_status')
                      ? 'border-red-300 bg-red-50 focus:border-red-500'
                      : 'border-gray-200 bg-gray-50 focus:border-gray-900 focus:bg-white'
                  }`}
                >
                  <option value="">선택</option>
                  {EDUCATION_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {EDUCATION_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                <FiCalendar className="text-gray-400" size={14} />
                졸업년도 (졸업/수료 선택 시 필수)
              </label>
              <select
                value={graduationYear}
                onChange={(e) => {
                  setGraduationYear(e.target.value);
                  clearInvalidField('basic_graduation_year');
                }}
                disabled={!isGraduationYearRequired}
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                  hasInvalidField('basic_graduation_year')
                    ? 'border-red-300 bg-red-50 focus:border-red-500'
                    : 'border-gray-200 bg-gray-50 focus:border-gray-900 focus:bg-white'
                } disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400`}
              >
                <option value="">-- 졸업년도를 선택하세요 --</option>
                {availableGraduationYearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                연락처
                <RequirementBadge />
              </label>
              <input
                type="tel"
                value={contactData.phone}
                onChange={(e) => setContactData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="010-1234-5678"
                className="w-full px-4 py-3 text-sm transition-all border border-gray-200 outline-none rounded-xl bg-gray-50 focus:border-gray-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                공개 범위
              </label>
              <div className="p-3 space-y-2 border border-gray-200 rounded-xl bg-gray-50">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={contactData.visibility === 'public'}
                    onChange={() => setContactData((prev) => ({ ...prev, visibility: 'public' }))}
                  />
                  전체 공개
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="visibility"
                    value="career_only"
                    checked={contactData.visibility === 'career_only'}
                    onChange={() => setContactData((prev) => ({ ...prev, visibility: 'career_only' }))}
                  />
                  이력만 공개 (연락처 비공개)
                </label>
              </div>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-700">직무 키워드</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="예: 마케팅, 백엔드, 데이터 분석"
                className={`flex-1 rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                  hasInvalidField('skills_tags')
                    ? 'border-red-300 bg-red-50 focus:border-red-500'
                    : 'border-gray-200 bg-gray-50 focus:border-gray-900 focus:bg-white'
                }`}
              />
              <button
                onClick={handleAddSkillTag}
                type="button"
                className="px-4 py-3 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800"
              >
                추가
              </button>
            </div>
            <div
              className={`flex min-h-16 flex-wrap gap-2 rounded-xl border p-3 ${
                hasInvalidField('skills_tags') ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              {skillTags.length === 0 ? (
                <p className="text-sm text-gray-400">아직 추가된 키워드가 없습니다.</p>
              ) : (
                skillTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSkillTags((prev) => prev.filter((item) => item !== tag))}
                    className="px-3 py-1 text-xs font-medium text-blue-700 transition-all rounded-full bg-blue-50 hover:bg-blue-100"
                  >
                    #{tag} ✕
                  </button>
                ))
              )}
            </div>
          </div>
        );

      case 'works':
        return (
          <div className="space-y-3">
            {works.map((work, index) => {
              return (
                <div key={`work-${index}`} className="p-4 space-y-3 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">
                      {work.company.trim() || work.position.trim()
                        ? `${work.company.trim() || '회사 미입력'} / ${work.position.trim() || '직무 미입력'}`
                        : '새 경력'}
                    </p>
                    {works.length > 1 && index > 0 && (
                      <button
                        type="button"
                        onClick={() => setWorks((prev) => prev.filter((_, i) => i !== index))}
                        className="text-xs text-gray-400 hover:text-red-500"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                <label className="flex items-center gap-2 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={work.is_current}
                    onChange={(e) => {
                      setWorks((prev) =>
                        prev.map((item, i) =>
                          i === index
                            ? {
                                ...item,
                                is_current: e.target.checked,
                              }
                            : item,
                        ),
                      );
                    }}
                  />
                  현재 재직 중
                </label>
                <input
                  type="text"
                  value={work.company}
                  onChange={(e) => {
                    setWorks((prev) =>
                      prev.map((item, i) => (i === index ? { ...item, company: e.target.value } : item)),
                    );
                    clearInvalidField(`works_${index}_company`);
                  }}
                  placeholder="회사명"
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                    hasInvalidField(`works_${index}_company`)
                      ? 'border-red-300 bg-red-50 focus:border-red-500'
                      : 'border-gray-200 bg-gray-50 focus:border-gray-900'
                  }`}
                />
                <input
                  type="text"
                  value={work.position}
                  onChange={(e) => {
                    setWorks((prev) =>
                      prev.map((item, i) => (i === index ? { ...item, position: e.target.value } : item)),
                    );
                    clearInvalidField(`works_${index}_position`);
                  }}
                  placeholder="직무/포지션"
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                    hasInvalidField(`works_${index}_position`)
                      ? 'border-red-300 bg-red-50 focus:border-red-500'
                      : 'border-gray-200 bg-gray-50 focus:border-gray-900'
                  }`}
                />
                <select
                  value={work.employment_type}
                  onChange={(e) =>
                    setWorks((prev) =>
                      prev.map((item, i) =>
                        i === index
                          ? { ...item, employment_type: e.target.value as WorkExperience['employment_type'] }
                          : item,
                      ),
                    )
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-gray-50 focus:border-gray-900"
                >
                  {EMPLOYMENT_OPTIONS.map((employmentType) => (
                    <option key={employmentType} value={employmentType}>
                      {EMPLOYMENT_LABELS[employmentType]}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={work.region || ''}
                  onChange={(e) =>
                    setWorks((prev) =>
                      prev.map((item, i) => (i === index ? { ...item, region: e.target.value } : item)),
                    )
                  }
                  placeholder="근무 지역 (선택)"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-gray-50 focus:border-gray-900"
                />
              </div>
              );
            })}
            <button
              type="button"
              onClick={() => setWorks((prev) => [...prev, createEmptyWork(false)])}
              className="w-full py-2 text-sm font-medium text-gray-600 transition-all border border-gray-300 border-dashed rounded-lg hover:border-gray-500 hover:text-gray-800"
            >
              + 경력 추가
            </button>
          </div>
        );

      case 'mentor-qna':
        return (
          <div className="space-y-4">
            {mentorQnaSubStep === 1 && (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Q1. 수도권 취업/창업을 시도해 본 적이 있나요?</p>
                  <div
                    className={`flex gap-2 rounded-lg border p-2 ${
                      hasInvalidField('mentor_qna_targeted_capital') ? 'border-red-300 bg-red-50' : 'border-transparent'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setMentorQna((prev) => ({ ...prev, targeted_capital: true }));
                        clearInvalidField('mentor_qna_targeted_capital');
                      }}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                        mentorQna.targeted_capital === true
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      예
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMentorQna((prev) => ({ ...prev, targeted_capital: false }));
                        clearInvalidField('mentor_qna_targeted_capital');
                      }}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                        mentorQna.targeted_capital === false
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      아니오
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Q2. 지역에서 취·창업하게 된 이유는 무엇인가요?
                  </label>
                  <textarea
                    rows={3}
                    value={mentorQna.reason_for_local || ''}
                    onChange={(e) => {
                      setMentorQna((prev) => ({ ...prev, reason_for_local: e.target.value || null }));
                      clearInvalidField('mentor_qna_reason_for_local');
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                      hasInvalidField('mentor_qna_reason_for_local')
                        ? 'border-red-300 bg-red-50 focus:border-red-500'
                        : 'border-gray-200 bg-gray-50 focus:border-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Q3. 지역 취·창업 시 도움받은 기관/멘토가 있나요?
                  </label>
                  <textarea
                    rows={3}
                    value={mentorQna.helpful_organizations || ''}
                    onChange={(e) => {
                      setMentorQna((prev) => ({ ...prev, helpful_organizations: e.target.value || null }));
                      clearInvalidField('mentor_qna_helpful_organizations');
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                      hasInvalidField('mentor_qna_helpful_organizations')
                        ? 'border-red-300 bg-red-50 focus:border-red-500'
                        : 'border-gray-200 bg-gray-50 focus:border-gray-900'
                    }`}
                  />
                </div>
              </>
            )}
            {mentorQnaSubStep === 2 && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Q4. 지역 취·창업의 장점은 무엇인가요?
                  </label>
                  <textarea
                    rows={3}
                    value={mentorQna.local_advantages || ''}
                    onChange={(e) => {
                      setMentorQna((prev) => ({ ...prev, local_advantages: e.target.value || null }));
                      clearInvalidField('mentor_qna_local_advantages');
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                      hasInvalidField('mentor_qna_local_advantages')
                        ? 'border-red-300 bg-red-50 focus:border-red-500'
                        : 'border-gray-200 bg-gray-50 focus:border-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Q5. 지역 취·창업의 단점/아쉬운 점은 무엇인가요?
                  </label>
                  <textarea
                    rows={3}
                    value={mentorQna.local_disadvantages || ''}
                    onChange={(e) => {
                      setMentorQna((prev) => ({ ...prev, local_disadvantages: e.target.value || null }));
                      clearInvalidField('mentor_qna_local_disadvantages');
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                      hasInvalidField('mentor_qna_local_disadvantages')
                        ? 'border-red-300 bg-red-50 focus:border-red-500'
                        : 'border-gray-200 bg-gray-50 focus:border-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                    Q6. 후배들에게 전하고 싶은 조언을 적어주세요.
                    <RequirementBadge />
                  </label>
                  <textarea
                    rows={4}
                    value={mentorQna.advice_for_juniors || ''}
                    onChange={(e) =>
                      setMentorQna((prev) => ({ ...prev, advice_for_juniors: e.target.value || null }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-900"
                  />
                </div>
              </>
            )}
          </div>
        );

      case 'review':
        return (
          <div className="p-4 space-y-3 border border-gray-200 rounded-xl bg-gray-50">
            <p className="text-sm font-semibold text-gray-800">입력 요약</p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>학교: {formData.school || '미입력'}</p>
              <p>학과: {formData.dept_name || '미입력'}</p>
              <p>학번: {formData.admission_year ? `${formData.admission_year}학번` : '미입력'}</p>
              <p>학위: {educationDegree ? EDUCATION_DEGREE_LABELS[educationDegree] : '미입력'}</p>
              <p>상태: {educationStatus ? EDUCATION_STATUS_LABELS[educationStatus] : '미입력'}</p>
              <p>직무 키워드: {skillTags.length}개</p>
              <p>경력: {normalizeWorks.length}개</p>
              <p>학력: {normalizeEducations.length}개</p>
            </div>
            <p className="text-xs text-gray-400">
              완료를 누르면 온보딩과 이력 정보가 저장됩니다. 추후 프로필 &gt; 이력관리에서 수정할 수 있습니다.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  if (mentorCompleted) {
    return (
      <FullPageModal isOpen={isOpen} onClose={() => {}} title="" showBackButton={false} mode="overlay">
        <div className="flex min-h-full flex-col items-center justify-center px-5 py-12">
          <div className="mb-6 text-7xl">🎉</div>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">환영합니다, 선배님!</h2>
          <p className="mb-2 text-center text-sm leading-relaxed text-gray-500">
            멘토 정보가 성공적으로 등록되었습니다.
            <br />
            후배들에게 큰 도움이 될 거예요!
          </p>
          <p className="mb-10 text-center text-xs text-gray-400">
            프로필 &gt; 이력관리에서 언제든지 수정할 수 있습니다.
          </p>
          <button
            onClick={() => onComplete(mentorCompleted)}
            className="w-full max-w-xs rounded-xl bg-gray-900 py-4 font-bold text-white transition-all hover:bg-gray-800"
          >
            제로타임 둘러보기
          </button>
        </div>
      </FullPageModal>
    );
  }

  return (
    <FullPageModal isOpen={isOpen} onClose={() => {}} title="환영합니다" showBackButton={false} mode="overlay">
      {step === 1 && (
        <div className="flex flex-col min-h-full px-5 py-8">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-6">
              <Logo className="h-12" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              제로타임에 오신 것을 환영합니다!
            </h2>
            <p className="text-sm text-gray-500">나에게 해당하는 유형을 선택해주세요</p>
          </div>

          <div className="grid grid-cols-2 gap-3 px-2">
            <button
              onClick={() => handleUserTypeSelect('student')}
              className={`relative flex flex-col items-center rounded-2xl border-2 p-5 transition-all ${
                userType === 'student'
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {userType === 'student' && (
                <div className="absolute flex items-center justify-center w-5 h-5 text-white bg-blue-500 rounded-full right-2 top-2">
                  <FiCheck size={12} strokeWidth={3} />
                </div>
              )}
              <div className="mb-3 text-4xl">🎓</div>
              <p className="text-base font-bold text-gray-800">학생</p>
              <p className="mt-1 text-xs text-gray-400">재학생/신입생</p>
            </button>

            <button
              onClick={() => handleUserTypeSelect('mentor')}
              className={`relative flex flex-col items-center rounded-2xl border-2 p-5 transition-all ${
                userType === 'mentor'
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {userType === 'mentor' && (
                <div className="absolute flex items-center justify-center w-5 h-5 text-white bg-blue-500 rounded-full right-2 top-2">
                  <FiCheck size={12} strokeWidth={3} />
                </div>
              )}
              <div className="mb-3 text-4xl">💼</div>
              <p className="text-base font-bold text-gray-800">멘토님</p>
              <p className="mt-1 text-xs text-gray-400">재직자/멘토</p>
            </button>
          </div>

          <div className="flex flex-col gap-3 pt-10 mt-auto pb-safe">
            <button
              onClick={handleNext}
              disabled={!userType}
              className="w-full py-4 font-bold text-white transition-all bg-gray-900 rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {step === 2 && userType === 'student' && (
        <div className="flex flex-col min-h-full px-5 py-8">
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              학교 정보를 알려주세요
            </h2>
            <p className="text-sm text-gray-500">
              <>
                소속 정보를 알려주시면
                <br />
                맞춤형 공지사항을 자동으로 구독해 드려요!
              </>
            </p>
            <button
              onClick={() => {
                setStep(1);
                setUserType(null);
              }}
              className="mt-3 text-xs font-medium text-gray-400 transition-all hover:text-gray-600"
            >
              학생/멘토님 다시 선택하기
            </button>
          </div>

          <div className="flex-1 space-y-6">
            <UserInfoForm
              formData={formData}
              onChange={(data) => setFormData((prev: UserInfoFormData) => ({ ...prev, ...data }))}
              showNickname={false}
              isReadonlySchool={false}
            />
          </div>

          <div className="flex flex-col gap-3 mt-10 pb-safe">
            <button
              onClick={handleSubmit}
              disabled={isStudentSubmitDisabled}
              className="w-full py-4 font-bold text-white transition-all bg-gray-900 rounded-xl hover:bg-gray-800 disabled:bg-gray-300"
            >
              {isSubmitting ? '준비 중...' : isLoggedIn ? '시작하기' : '로그인 후 저장하기'}
            </button>
            <button
              onClick={handleSkip}
              disabled={isSubmitting}
              className="w-full py-2 text-sm font-medium text-gray-400 transition-all hover:text-gray-600"
            >
              건너뛰기
            </button>
          </div>
        </div>
      )}

      {step === 2 && userType === 'mentor' && (
        <div className="flex flex-col px-5 py-6">
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500">{mentorStepTitle}</p>
              <p className="text-xs font-semibold text-gray-500">
                {currentMentorScreen} / {totalMentorScreens}
              </p>
            </div>
            <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${mentorProgress}%`,
                  transition: 'width 280ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />
            </div>
          </div>

          <div
            key={`mentor-step-${mentorStepIndex}-${currentMentorStep?.key === 'mentor-qna' ? mentorQnaSubStep : 0}`}
            className="mentor-step-animated flex-1"
            style={{
              animation:
                slideDirection === 1
                  ? 'mentorStepInFromRight 300ms cubic-bezier(0.22, 1, 0.36, 1)'
                  : 'mentorStepInFromLeft 300ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div className="mb-4 text-center">
              <h2 className="mb-2 text-xl font-bold text-gray-900">{mentorStepTitle}</h2>
              <p className="text-sm text-gray-500">{mentorStepDescription}</p>
              <button
                onClick={() => {
                  setStep(1);
                  setUserType(null);
                  setMentorStepIndex(0);
                  setMentorQnaSubStep(1);
                }}
                className="mt-3 text-xs font-medium text-gray-400 transition-all hover:text-gray-600"
              >
                학생/멘토님 다시 선택하기
              </button>
            </div>
            {renderMentorStepContent()}
          </div>

          <div className="mt-5 space-y-2 pb-safe sticky bottom-0 bg-white pt-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMentorPrev}
                disabled={(mentorStepIndex === 0 && !(currentMentorStep?.key === 'mentor-qna' && mentorQnaSubStep === 2)) || isSubmitting}
                className="w-1/3 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition-all hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                이전
              </button>
              <button
                type="button"
                onClick={() => {
                  if (mentorStepIndex === MENTOR_STEPS.length - 1) {
                    handleMentorComplete();
                    return;
                  }
                  handleMentorNext();
                }}
                disabled={isSubmitting}
                className="w-2/3 py-3 text-sm font-bold text-white transition-all bg-gray-900 rounded-xl hover:bg-gray-800 disabled:bg-gray-300"
              >
                {mentorStepIndex === MENTOR_STEPS.length - 1
                  ? isSubmitting
                    ? '저장 중...'
                    : isLoggedIn
                      ? '완료하기'
                      : '로그인 후 저장하기'
                  : '다음'}
              </button>
            </div>
            {currentMentorStep.optional && mentorStepIndex < MENTOR_STEPS.length - 1 && (
              <button
                type="button"
                onClick={() => goToMentorStep(mentorStepIndex + 1)}
                disabled={isSubmitting}
                className="w-full py-2 text-sm font-medium text-gray-400 transition-all hover:text-gray-600"
              >
                이번 단계 건너뛰기
              </button>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes mentorStepInFromRight {
          from {
            opacity: 0;
            transform: translate3d(28px, 0, 0) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes mentorStepInFromLeft {
          from {
            opacity: 0;
            transform: translate3d(-28px, 0, 0) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mentor-step-animated {
            animation: none !important;
          }
        }
      `}</style>
    </FullPageModal>
  );
}
