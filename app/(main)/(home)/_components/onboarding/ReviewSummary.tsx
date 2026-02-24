'use client';

import type { UserInfoFormData } from '@/_components/auth/UserInfoForm';
import type { Education, MentorQnA, WorkExperience } from '@/_types/career';

import ReviewSectionCard from './ReviewSectionCard';

type VisibilityType = 'public' | 'career_only';

const VISIBILITY_LABELS: Record<VisibilityType, string> = {
  public: '전체 공개',
  career_only: '이력만 공개 (연락처 비공개)',
};

const MISSING_TEXT = '미입력';

const toSingleLinePreview = (value: string | null, maxLength = 42): string => {
  const normalized = (value || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return MISSING_TEXT;
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength)}...`;
};

const toDisplay = (value: string): string => {
  const trimmed = value.trim();
  return trimmed ? trimmed : MISSING_TEXT;
};

const hasAnyInvalid = (keys: string[], hasInvalidField: (fieldKey: string) => boolean): boolean =>
  keys.some((key) => hasInvalidField(key));

interface ReviewSummaryProps {
  formData: UserInfoFormData;
  educationDegree: Education['degree'] | '';
  educationStatus: Education['status'] | '';
  graduationYear: string;
  graduationRequiredStatuses: Education['status'][];
  educationDegreeLabels: Record<Education['degree'], string>;
  educationStatusLabels: Record<Education['status'], string>;
  contactData: {
    phone: string;
    visibility: VisibilityType;
  };
  skillTags: string[];
  works: Omit<WorkExperience, 'id'>[];
  seniorQna: MentorQnA;
  hasInvalidField: (fieldKey: string) => boolean;
  hasPrivacyConsent: boolean;
  onPrivacyConsentChange: (checked: boolean) => void;
  clearInvalidField: (fieldKey: string) => void;
  onEditBasic: () => void;
  onEditContact: () => void;
  onEditSkills: () => void;
  onEditWorks: () => void;
  onEditQna: () => void;
}

export default function ReviewSummary({
  formData,
  educationDegree,
  educationStatus,
  graduationYear,
  graduationRequiredStatuses,
  educationDegreeLabels,
  educationStatusLabels,
  contactData,
  skillTags,
  works,
  seniorQna,
  hasInvalidField,
  hasPrivacyConsent,
  onPrivacyConsentChange,
  clearInvalidField,
  onEditBasic,
  onEditContact,
  onEditSkills,
  onEditWorks,
  onEditQna,
}: ReviewSummaryProps) {
  const isGraduationYearRequired =
    educationStatus !== '' && graduationRequiredStatuses.includes(educationStatus as Education['status']);

  const basicHasIssue =
    hasAnyInvalid(['basic_school', 'basic_major', 'basic_admission_year'], hasInvalidField) ||
    !formData.school.trim() ||
    !formData.dept_name.trim() ||
    !formData.admission_year.trim();
  const educationHasIssue =
    hasAnyInvalid(['basic_degree', 'basic_status', 'basic_graduation_year'], hasInvalidField) ||
    !educationDegree ||
    !educationStatus ||
    (isGraduationYearRequired && !graduationYear.trim());
  const skillsHasIssue = hasInvalidField('skills_tags') || skillTags.length === 0;
  const worksHasIssue = works.length === 0 || hasAnyInvalid(['works_0_company', 'works_0_position'], hasInvalidField);
  const qnaHasIssue =
    hasAnyInvalid(
      [
        'senior_qna_targeted_capital',
        'senior_qna_reason_for_local',
        'senior_qna_helpful_organizations',
        'senior_qna_local_advantages',
        'senior_qna_local_disadvantages',
      ],
      hasInvalidField,
    ) ||
    seniorQna.targeted_capital === null ||
    !seniorQna.reason_for_local?.trim() ||
    !seniorQna.helpful_organizations?.trim() ||
    !seniorQna.local_advantages?.trim() ||
    !seniorQna.local_disadvantages?.trim();

  const topSkillTags = skillTags.slice(0, 3);
  const extraSkillTagCount = Math.max(skillTags.length - topSkillTags.length, 0);
  const topWorks = works.slice(0, 2);

  const qnaRows = [
    {
      label: 'Q1. 수도권 취·창업 시도 여부',
      value:
        seniorQna.targeted_capital === null ? MISSING_TEXT : seniorQna.targeted_capital ? '예' : '아니오',
      isDone: seniorQna.targeted_capital !== null,
    },
    {
      label: 'Q2. 지역에서 취·창업하게 된 이유',
      value: toSingleLinePreview(seniorQna.reason_for_local),
      isDone: Boolean(seniorQna.reason_for_local?.trim()),
    },
    {
      label: 'Q3. 도움받은 기관/사람',
      value: toSingleLinePreview(seniorQna.helpful_organizations),
      isDone: Boolean(seniorQna.helpful_organizations?.trim()),
    },
    {
      label: 'Q4. 지역 취·창업 장점',
      value: toSingleLinePreview(seniorQna.local_advantages),
      isDone: Boolean(seniorQna.local_advantages?.trim()),
    },
    {
      label: 'Q5. 지역 취·창업 단점/아쉬운 점',
      value: toSingleLinePreview(seniorQna.local_disadvantages),
      isDone: Boolean(seniorQna.local_disadvantages?.trim()),
    },
  ];

  return (
    <div className="space-y-2 pb-2">
      <ReviewSectionCard title="기본정보" hasIssue={basicHasIssue} onEdit={onEditBasic}>
        <div className="grid grid-cols-[72px_1fr] gap-x-2.5 gap-y-0.5 text-[13px] text-gray-700">
          <p className="text-gray-500">학교</p>
          <p className="break-words">{toDisplay(formData.school)}</p>
          <p className="text-gray-500">학과</p>
          <p className="break-words">{toDisplay(formData.dept_name)}</p>
          <p className="text-gray-500">학번</p>
          <p>{formData.admission_year.trim() ? `${formData.admission_year.trim()}학번` : MISSING_TEXT}</p>
        </div>
      </ReviewSectionCard>

      <ReviewSectionCard title="학력" hasIssue={educationHasIssue} onEdit={onEditBasic}>
        <div className="grid grid-cols-[72px_1fr] gap-x-2.5 gap-y-0.5 text-[13px] text-gray-700">
          <p className="text-gray-500">학위</p>
          <p>{educationDegree ? educationDegreeLabels[educationDegree] : MISSING_TEXT}</p>
          <p className="text-gray-500">상태</p>
          <p>{educationStatus ? educationStatusLabels[educationStatus] : MISSING_TEXT}</p>
          <p className="text-gray-500">졸업년도</p>
          <p>{isGraduationYearRequired ? (graduationYear.trim() ? `${graduationYear.trim()}년` : MISSING_TEXT) : '-'}</p>
        </div>
      </ReviewSectionCard>

      <ReviewSectionCard title="연락/공개범위" onEdit={onEditContact}>
        <div className="grid grid-cols-[72px_1fr] gap-x-2.5 gap-y-0.5 text-[13px] text-gray-700">
          <p className="text-gray-500">연락처</p>
          <p>{toDisplay(contactData.phone)}</p>
          <p className="text-gray-500">공개범위</p>
          <p>{VISIBILITY_LABELS[contactData.visibility]}</p>
        </div>
      </ReviewSectionCard>

      <ReviewSectionCard title="직무 키워드" hasIssue={skillsHasIssue} onEdit={onEditSkills}>
        {skillTags.length === 0 ? (
          <p className="text-[13px] text-gray-600">{MISSING_TEXT}</p>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            {topSkillTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex h-6 items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 text-[11px] font-semibold text-sky-800"
              >
                {tag}
              </span>
            ))}
            {extraSkillTagCount > 0 && (
              <span className="inline-flex h-6 items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 text-[11px] font-semibold text-gray-600">
                +{extraSkillTagCount}
              </span>
            )}
          </div>
        )}
      </ReviewSectionCard>

      <ReviewSectionCard title="경력" hasIssue={worksHasIssue} onEdit={onEditWorks}>
        {topWorks.length === 0 ? (
          <p className="text-[13px] text-gray-600">{MISSING_TEXT}</p>
        ) : (
          <div className="space-y-1">
            {topWorks.map((work, index) => (
              <p key={`${work.company}-${work.position}-${index}`} className="text-[13px] text-gray-700">
                {index + 1}. {toDisplay(work.company)} / {toDisplay(work.position)}
              </p>
            ))}
            {works.length > topWorks.length && (
              <p className="text-xs text-gray-500">총 {works.length}개 경력</p>
            )}
          </div>
        )}
      </ReviewSectionCard>

      <ReviewSectionCard title="Q&A 요약" hasIssue={qnaHasIssue} onEdit={onEditQna}>
        <div className="space-y-1.5">
          {qnaRows.map((row) => (
            <div
              key={row.label}
              className={`rounded-lg border px-2.5 py-1.5 ${
                row.isDone ? 'border-gray-200 bg-gray-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="mb-0.5 flex items-center justify-between gap-2">
                <p className="text-[11px] font-medium text-gray-600">{row.label}</p>
                <span className={`text-[11px] font-semibold ${row.isDone ? 'text-blue-600' : 'text-red-500'}`}>
                  {row.isDone ? '답변완료' : '미입력'}
                </span>
              </div>
              <p className="text-[13px] text-gray-700 break-words">{row.value}</p>
            </div>
          ))}
        </div>
      </ReviewSectionCard>

      <section
        className={`rounded-xl border p-3 ${
          hasInvalidField('review_privacy_consent') ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
        }`}
      >
        <label className="flex items-start gap-2 text-[13px] font-medium text-gray-800">
          <input
            type="checkbox"
            checked={hasPrivacyConsent}
            onChange={(e) => {
              onPrivacyConsentChange(e.target.checked);
              clearInvalidField('review_privacy_consent');
            }}
            className="mt-0.5"
          />
          개인정보를 공유하는데 동의하십니까?
        </label>
        <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500">
          정식 런칭 이후에는 개인을 식별할 수 없는 형태로 일부 이력 정보가 활용될 수 있습니다.
        </p>
      </section>

      <p className="px-1 text-[11px] text-gray-400">
        완료를 누르면 온보딩과 이력 정보가 저장됩니다. (프로필 &gt; 이력관리에서 수정할 수 있습니다.)
      </p>
    </div>
  );
}
