'use client';

import { useEffect, useState, type KeyboardEvent } from 'react';
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
import UserInfoForm, { UserInfoFormData } from '@/_components/auth/UserInfoForm';
import FullPageModal from '@/_components/layout/FullPageModal';
import Logo from '@/_components/ui/Logo';
import { useUserStore } from '@/_lib/store/useUserStore';
import { FiCalendar, FiCheck } from 'react-icons/fi';
import type {
  Education,
  MentorQnA,
  WorkExperience,
} from '@/_types/career';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (categories: string[]) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

type UserType = 'student' | 'mentor';
type VisibilityType = 'public' | 'career_only';
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
    description: '학력 핵심 정보를 입력해 주세요',
  },
  {
    key: 'contact',
    title: '연락 정보',
    description: '후배들이 볼 공개 범위를 선택해 주세요',
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
    optional: true,
  },
  {
    key: 'review',
    title: '최종 확인',
    description: '입력한 내용을 확인하고 완료해 주세요',
  },
];

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

const YEAR_MONTH_REGEX = /^\d{4}\.\d{2}$/;
const YEAR_REGEX = /^\d{4}$/;
const CURRENT_YEAR = new Date().getFullYear();
const WORK_YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 1979 }, (_, i) => (CURRENT_YEAR - i).toString());
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
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

const isYearMonth = (value: string): boolean => YEAR_MONTH_REGEX.test(value.trim());
const splitYearMonth = (value: string | null): { year: string; month: string } => {
  if (!value) return { year: '', month: '' };
  const [year = '', month = ''] = value.split('.');
  return { year, month };
};
const joinYearMonth = (year: string, month: string): string => {
  if (!year && !month) return '';
  if (year && month) return `${year}.${month}`;
  if (year) return `${year}.`;
  return `.${month}`;
};

function RequirementBadge() {
  return (
    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">선택</span>
  );
}

export default function OnboardingModal({ isOpen, onComplete, onShowToast }: OnboardingModalProps) {
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
    name: string;
    email: string;
    phone: string;
    visibility: VisibilityType;
  }>({
    name: '',
    email: '',
    phone: '',
    visibility: 'career_only',
  });
  const [skillInput, setSkillInput] = useState<string>('');
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [works, setWorks] = useState<Omit<WorkExperience, 'id'>[]>([createEmptyWork(false)]);
  const [graduationYear, setGraduationYear] = useState<string>('');
  const [mentorQna, setMentorQna] = useState<MentorQnA>(createEmptyMentorQna());
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    setContactData((prev) => ({
      ...prev,
      name: prev.name || currentUser?.nickname || '',
      email: prev.email || currentUser?.email || '',
    }));
  }, [currentUser?.email, currentUser?.nickname]);

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    if (type === 'mentor') {
      setMentorStepIndex(0);
      setSlideDirection(1);
    }
  };

  const handleNext = () => {
    if (!userType) return;
    setStep(2);
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

    setIsSubmitting(true);

    let boardCodes: string[] = [...GUEST_DEFAULT_BOARDS];
    if (userType === 'student' && formData.dept_code) {
      const preset = MAJOR_PRESETS.find(
        (p) => p.label === formData.dept_name || p.id === formData.dept_code.replace('dept_', ''),
      );
      if (preset) {
        boardCodes = preset.categories;
      } else {
        boardCodes.push(formData.dept_code);
      }
    }

    try {
      const result = await completeOnboarding({
        user_type: userType,
        school: formData.school || '전북대',
        dept_code: formData.dept_code || undefined,
        admission_year: formData.admission_year ? parseInt(formData.admission_year) : undefined,
        board_codes: boardCodes,
      });

      queryClient.setQueryData(['user', 'profile'], result.user);
      setUser(result.user);
      localStorage.setItem('my_subscribed_categories', JSON.stringify(result.subscribed_boards));
      onShowToast?.('제로타임에 오신 것을 환영합니다! 🎉', 'success');
      onComplete(result.subscribed_boards);
    } catch (error) {
      console.error('온보딩 처리 실패:', error);
      alert('정보 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
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

    setIsSubmitting(true);
    try {
      const defaultBoards = [...GUEST_DEFAULT_BOARDS];
      const result = await completeOnboarding({
        user_type: userType,
        school: '전북대',
        board_codes: defaultBoards,
      });

      queryClient.setQueryData(['user', 'profile'], result.user);
      setUser(result.user);
      localStorage.setItem('my_subscribed_categories', JSON.stringify(defaultBoards));
      onShowToast?.('제로타임에 오신 것을 환영합니다! 🎉', 'success');
      onComplete(defaultBoards);
    } catch (error) {
      console.error('건너뛰기 실패:', error);
    } finally {
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
  const mentorProgress = ((mentorStepIndex + 1) / MENTOR_STEPS.length) * 100;
  const isStudentSubmitDisabled =
    isSubmitting ||
    !formData.school.trim() ||
    !formData.dept_code.trim() ||
    !formData.admission_year.trim() ||
    !/^\d{2}$/.test(formData.admission_year.trim());

  const hasAnyWorkInput = (work: Omit<WorkExperience, 'id'>) =>
    Boolean(work.start_date.trim() || work.end_date || work.company.trim() || work.position.trim() || work.region || work.is_current);

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
      if (!contactData.name.trim()) missing.push('contact_name');
      if (!contactData.email.trim()) missing.push('contact_email');
    }

    if (currentMentorStep.key === 'skills' && skillTags.length === 0) {
      missing.push('skills_tags');
    }

    if (currentMentorStep.key === 'works') {
      const hasAtLeastOneWork = works.some((work) => hasAnyWorkInput(work));
      if (!hasAtLeastOneWork) {
        missing.push('works_0_start_date');
        missing.push('works_0_company');
        missing.push('works_0_position');
        return missing;
      }

      for (let i = 0; i < works.length; i += 1) {
        const work = works[i];
        if (!hasAnyWorkInput(work)) continue;
        const startYM = splitYearMonth(work.start_date);
        if (!startYM.year || !startYM.month) missing.push(`works_${i}_start_date`);
        if (!work.is_current) {
          const endYM = splitYearMonth(work.end_date);
          if (!endYM.year || !endYM.month) missing.push(`works_${i}_end_date`);
        }
        if (!work.company.trim()) missing.push(`works_${i}_company`);
        if (!work.position.trim()) missing.push(`works_${i}_position`);
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
      if (contactData.email.trim() && !contactData.email.includes('@')) {
        return '올바른 이메일 형식으로 입력해 주세요.';
      }
    }

    if (currentMentorStep.key === 'works') {
      for (let i = 0; i < works.length; i += 1) {
        const work = works[i];
        if (!hasAnyWorkInput(work)) continue;
        const workLabel = `${work.company.trim() || '회사 미입력'} / ${work.position.trim() || '직무 미입력'}`;
        const startYM = splitYearMonth(work.start_date);
        if (startYM.year && startYM.month && !isYearMonth(work.start_date)) {
          return `${workLabel} 시작일 형식이 올바르지 않습니다.`;
        }
        if (!work.is_current && work.end_date) {
          const endYM = splitYearMonth(work.end_date);
          if ((endYM.year || endYM.month) && !isYearMonth(work.end_date)) {
            return `${workLabel} 종료일 형식이 올바르지 않습니다.`;
          }
          if (isYearMonth(work.start_date) && isYearMonth(work.end_date)) {
            const startValue = Number(startYM.year) * 100 + Number(startYM.month);
            const endValue = Number(endYM.year) * 100 + Number(endYM.month);
            if (endValue < startValue) {
              return `${workLabel} 종료일은 시작일 이후여야 합니다.`;
            }
          }
        }
      }
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
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkillTag();
    }
  };

  const goToMentorStep = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= MENTOR_STEPS.length) return;
    setSlideDirection(nextIndex > mentorStepIndex ? 1 : -1);
    setInvalidFields(new Set());
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
    if (mentorStepIndex < MENTOR_STEPS.length - 1) {
      goToMentorStep(mentorStepIndex + 1);
    }
  };

  const normalizeWorks = works
    .filter(hasAnyWorkInput)
    .map((work) => ({
      ...work,
      company: work.company.trim(),
      position: work.position.trim(),
      start_date: work.start_date.trim(),
      end_date: work.is_current ? null : toNullable(work.end_date || ''),
      region: (work.region || '').trim(),
    }));

  const normalizeEducations: Omit<Education, 'id'>[] =
    formData.dept_code.trim() && formData.admission_year.trim()
      ? [
          {
            start_date: `20${formData.admission_year.trim()}`,
            end_date: graduationYear.trim(),
            is_current: false,
            school: (formData.school === '전북대' ? '전북대학교' : formData.school).trim(),
            major: (formData.dept_name || formData.dept_code).trim(),
            degree: 'bachelor',
            status: 'graduated',
            region: '',
          },
        ]
      : [];

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

    setIsSubmitting(true);
    try {
      const onboardingResult = await completeOnboarding({
        user_type: userType,
        school: formData.school || '전북대',
        dept_code: formData.dept_code || undefined,
        admission_year: formData.admission_year ? parseInt(formData.admission_year, 10) : undefined,
        board_codes: [...GUEST_DEFAULT_BOARDS],
      });

      await saveCareerContact({
        name: toNullable(contactData.name) || currentUser?.nickname || null,
        email: toNullable(contactData.email) || currentUser?.email || null,
        phone: toNullable(contactData.phone),
        visibility: contactData.visibility,
      });
      await saveCareerSkills({ skill_tags: skillTags });
      await saveCareerWorks({ works: normalizeWorks });
      await saveCareerEducations({ educations: normalizeEducations });
      await saveCareerMentorQnA({
        mentor_qna: {
          targeted_capital: mentorQna.targeted_capital,
          reason_for_local: toNullable(mentorQna.reason_for_local || ''),
          helpful_organizations: toNullable(mentorQna.helpful_organizations || ''),
          local_advantages: toNullable(mentorQna.local_advantages || ''),
          local_disadvantages: toNullable(mentorQna.local_disadvantages || ''),
          advice_for_juniors: toNullable(mentorQna.advice_for_juniors || ''),
        },
      });

      queryClient.setQueryData(['user', 'profile'], onboardingResult.user);
      setUser(onboardingResult.user);
      localStorage.setItem('my_subscribed_categories', JSON.stringify(onboardingResult.subscribed_boards));
      onShowToast?.('선배님 온보딩이 완료되었습니다! 🎉', 'success');
      onComplete(onboardingResult.subscribed_boards);
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
                if (Object.prototype.hasOwnProperty.call(data, 'admission_year')) clearInvalidField('basic_admission_year');
              }}
              showNickname={false}
              isReadonlySchool={false}
              invalidFields={{
                school: hasInvalidField('basic_school'),
                dept_code: hasInvalidField('basic_dept'),
                admission_year: hasInvalidField('basic_admission_year'),
              }}
            />
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                <FiCalendar className="text-gray-400" size={14} />
                졸업년도
              </label>
              <select
                value={graduationYear}
                onChange={(e) => {
                  setGraduationYear(e.target.value);
                  clearInvalidField('basic_graduation_year');
                }}
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                  hasInvalidField('basic_graduation_year')
                    ? 'border-red-300 bg-red-50 focus:border-red-500'
                    : 'border-gray-200 bg-gray-50 focus:border-gray-900 focus:bg-white'
                }`}
              >
                <option value="">-- 졸업년도를 선택하세요 --</option>
                {GRADUATION_YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-400">학과를 선택하면 관련 공지 구독이 자동으로 설정됩니다.</p>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">이름</label>
              <input
                type="text"
                value={contactData.name}
                onChange={(e) => {
                  setContactData((prev) => ({ ...prev, name: e.target.value }));
                  clearInvalidField('contact_name');
                }}
                placeholder="이름을 입력하세요"
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                  hasInvalidField('contact_name')
                    ? 'border-red-300 bg-red-50 focus:border-red-500'
                    : 'border-gray-200 bg-gray-50 focus:border-gray-900 focus:bg-white'
                }`}
              />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">이메일</label>
              <input
                type="email"
                value={contactData.email}
                onChange={(e) => {
                  setContactData((prev) => ({ ...prev, email: e.target.value }));
                  clearInvalidField('contact_email');
                }}
                placeholder="email@example.com"
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                  hasInvalidField('contact_email')
                    ? 'border-red-300 bg-red-50 focus:border-red-500'
                    : 'border-gray-200 bg-gray-50 focus:border-gray-900 focus:bg-white'
                }`}
              />
            </div>
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
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-gray-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                공개 범위
              </label>
              <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
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
                className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800"
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
                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition-all hover:bg-blue-100"
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
              const startYM = splitYearMonth(work.start_date);
              const endYM = splitYearMonth(work.end_date);
              return (
                <div key={`work-${index}`} className="space-y-3 rounded-xl border border-gray-200 p-4">
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
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid grid-cols-2 gap-1">
                      <select
                        value={startYM.year}
                        onChange={(e) => {
                          setWorks((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    start_date: joinYearMonth(e.target.value, startYM.month),
                                  }
                                : item,
                            ),
                          );
                          clearInvalidField(`works_${index}_start_date`);
                        }}
                        className={`rounded-lg border px-2 py-2 text-sm outline-none ${
                          hasInvalidField(`works_${index}_start_date`)
                            ? 'border-red-300 bg-red-50 focus:border-red-500'
                            : 'border-gray-200 bg-gray-50 focus:border-gray-900'
                        }`}
                      >
                        <option value="">시작</option>
                        {WORK_YEAR_OPTIONS.map((year) => (
                          <option key={`start-year-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                      <select
                        value={startYM.month}
                        onChange={(e) => {
                          setWorks((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    start_date: joinYearMonth(startYM.year, e.target.value),
                                  }
                                : item,
                            ),
                          );
                          clearInvalidField(`works_${index}_start_date`);
                        }}
                        className={`rounded-lg border px-2 py-2 text-sm outline-none ${
                          hasInvalidField(`works_${index}_start_date`)
                            ? 'border-red-300 bg-red-50 focus:border-red-500'
                            : 'border-gray-200 bg-gray-50 focus:border-gray-900'
                        }`}
                      >
                        <option value="">월</option>
                        {MONTH_OPTIONS.map((month) => (
                          <option key={`start-month-${month}`} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <select
                        value={endYM.year}
                        onChange={(e) => {
                          setWorks((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    end_date: joinYearMonth(e.target.value, endYM.month) || null,
                                  }
                                : item,
                            ),
                          );
                          clearInvalidField(`works_${index}_end_date`);
                        }}
                        disabled={work.is_current}
                        className={`rounded-lg border px-2 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:bg-gray-100 ${
                          hasInvalidField(`works_${index}_end_date`)
                            ? 'border-red-300 bg-red-50 focus:border-red-500'
                            : 'border-gray-200 bg-gray-50 focus:border-gray-900'
                        }`}
                      >
                        <option value="">종료</option>
                        {WORK_YEAR_OPTIONS.map((year) => (
                          <option key={`end-year-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                      <select
                        value={endYM.month}
                        onChange={(e) => {
                          setWorks((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    end_date: joinYearMonth(endYM.year, e.target.value) || null,
                                  }
                                : item,
                            ),
                          );
                          clearInvalidField(`works_${index}_end_date`);
                        }}
                        disabled={work.is_current}
                        className={`rounded-lg border px-2 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:bg-gray-100 ${
                          hasInvalidField(`works_${index}_end_date`)
                            ? 'border-red-300 bg-red-50 focus:border-red-500'
                            : 'border-gray-200 bg-gray-50 focus:border-gray-900'
                        }`}
                      >
                        <option value="">월</option>
                        {MONTH_OPTIONS.map((month) => (
                          <option key={`end-month-${month}`} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>
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
                                end_date: e.target.checked ? null : item.end_date,
                              }
                            : item,
                        ),
                      );
                      if (e.target.checked) {
                        clearInvalidField(`works_${index}_end_date`);
                      }
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
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-900"
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
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-900"
                />
              </div>
              );
            })}
            <button
              type="button"
              onClick={() => setWorks((prev) => [...prev, createEmptyWork(false)])}
              className="w-full rounded-lg border border-dashed border-gray-300 py-2 text-sm font-medium text-gray-600 transition-all hover:border-gray-500 hover:text-gray-800"
            >
              + 경력 추가
            </button>
          </div>
        );

      case 'mentor-qna':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Q1. 수도권 취업/창업을 시도해 본 적이 있나요?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMentorQna((prev) => ({ ...prev, targeted_capital: true }))}
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
                  onClick={() => setMentorQna((prev) => ({ ...prev, targeted_capital: false }))}
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
                onChange={(e) => setMentorQna((prev) => ({ ...prev, reason_for_local: e.target.value || null }))}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Q3. 지역 취·창업 시 도움받은 기관/멘토가 있나요?
              </label>
              <textarea
                rows={3}
                value={mentorQna.helpful_organizations || ''}
                onChange={(e) =>
                  setMentorQna((prev) => ({ ...prev, helpful_organizations: e.target.value || null }))
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Q4. 지역 취·창업의 장점은 무엇인가요?
              </label>
              <textarea
                rows={3}
                value={mentorQna.local_advantages || ''}
                onChange={(e) => setMentorQna((prev) => ({ ...prev, local_advantages: e.target.value || null }))}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Q5. 지역 취·창업의 단점/아쉬운 점은 무엇인가요?
              </label>
              <textarea
                rows={3}
                value={mentorQna.local_disadvantages || ''}
                onChange={(e) =>
                  setMentorQna((prev) => ({ ...prev, local_disadvantages: e.target.value || null }))
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Q6. 후배들에게 전하고 싶은 조언을 적어주세요.
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
          </div>
        );

      case 'review':
        return (
          <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-800">입력 요약</p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>학교: {formData.school || '미입력'}</p>
              <p>학과: {formData.dept_name || '미입력'}</p>
              <p>학번: {formData.admission_year ? `${formData.admission_year}학번` : '미입력'}</p>
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

  return (
    <FullPageModal isOpen={isOpen} onClose={() => {}} title="환영합니다">
      {step === 1 && (
        <div className="flex min-h-full flex-col px-5 py-8">
          <div className="mb-8 text-center">
            <div className="mb-6 flex justify-center">
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
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
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
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                  <FiCheck size={12} strokeWidth={3} />
                </div>
              )}
              <div className="mb-3 text-4xl">💼</div>
              <p className="text-base font-bold text-gray-800">선배님</p>
              <p className="mt-1 text-xs text-gray-400">재직자/멘토</p>
            </button>
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-10 pb-safe">
            <button
              onClick={handleNext}
              disabled={!userType}
              className="w-full rounded-xl bg-gray-900 py-4 font-bold text-white transition-all hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {step === 2 && userType === 'student' && (
        <div className="flex min-h-full flex-col px-5 py-8">
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
              학생/선배님 다시 선택하기
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

          <div className="mt-10 flex flex-col gap-3 pb-safe">
            <button
              onClick={handleSubmit}
              disabled={isStudentSubmitDisabled}
              className="w-full rounded-xl bg-gray-900 py-4 font-bold text-white transition-all hover:bg-gray-800 disabled:bg-gray-300"
            >
              {isSubmitting ? '준비 중...' : '시작하기'}
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
        <div className="flex h-full min-h-full flex-col px-5 py-6">
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500">{currentMentorStep.title}</p>
              <p className="text-xs font-semibold text-gray-500">
                {mentorStepIndex + 1} / {MENTOR_STEPS.length}
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{
                  width: `${mentorProgress}%`,
                  transition: 'width 280ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />
            </div>
          </div>

          <div
            key={`mentor-step-${mentorStepIndex}`}
            className="mentor-step-animated flex-1 overflow-y-auto"
            style={{
              animation:
                slideDirection === 1
                  ? 'mentorStepInFromRight 300ms cubic-bezier(0.22, 1, 0.36, 1)'
                  : 'mentorStepInFromLeft 300ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div className="mb-4 text-center">
              <h2 className="mb-2 text-xl font-bold text-gray-900">{currentMentorStep.title}</h2>
              <p className="text-sm text-gray-500">{currentMentorStep.description}</p>
              <button
                onClick={() => {
                  setStep(1);
                  setUserType(null);
                  setMentorStepIndex(0);
                }}
                className="mt-3 text-xs font-medium text-gray-400 transition-all hover:text-gray-600"
              >
                학생/선배님 다시 선택하기
              </button>
            </div>
            {renderMentorStepContent()}
          </div>

          <div className="mt-5 space-y-2 pb-safe">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToMentorStep(mentorStepIndex - 1)}
                disabled={mentorStepIndex === 0 || isSubmitting}
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
                className="w-2/3 rounded-xl bg-gray-900 py-3 text-sm font-bold text-white transition-all hover:bg-gray-800 disabled:bg-gray-300"
              >
                {mentorStepIndex === MENTOR_STEPS.length - 1
                  ? isSubmitting
                    ? '저장 중...'
                    : '완료하기'
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
