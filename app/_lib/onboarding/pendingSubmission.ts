import {
  completeOnboarding,
  saveCareerContact,
  saveCareerEducations,
  saveCareerMentorQnA,
  saveCareerSkills,
  saveCareerWorks,
} from '@/_lib/api';
import type {
  CareerContactUpdate,
  CareerEducationsUpdate,
  CareerMentorQnAUpdate,
  CareerSkillsUpdate,
  CareerWorksUpdate,
} from '@/_types/career';
import type { OnboardingRequest, UserProfile } from '@/_types/user';

export const PENDING_ONBOARDING_STORAGE_KEY = 'pending_onboarding_submission_v1';

export interface PendingSeniorCareerData {
  contact: CareerContactUpdate;
  skills: CareerSkillsUpdate;
  works: CareerWorksUpdate;
  educations: CareerEducationsUpdate;
  mentor_qna: CareerMentorQnAUpdate;
}

export interface PendingOnboardingSubmission {
  onboarding: OnboardingRequest;
  seniorCareer?: PendingSeniorCareerData;
  seniorPrivacyConsent?: boolean;
  // Legacy keys (backward compatibility)
  mentorCareer?: PendingSeniorCareerData;
  mentorPrivacyConsent?: boolean;
}

export interface OnboardingSubmissionResult {
  user: UserProfile;
  subscribedBoards: string[];
}

function normalizePendingSubmission(payload: PendingOnboardingSubmission): PendingOnboardingSubmission {
  const seniorCareer = payload.seniorCareer ?? payload.mentorCareer;
  const seniorPrivacyConsent =
    typeof payload.seniorPrivacyConsent === 'boolean' ? payload.seniorPrivacyConsent : payload.mentorPrivacyConsent;

  return {
    onboarding: payload.onboarding,
    ...(seniorCareer ? { seniorCareer } : {}),
    ...(typeof seniorPrivacyConsent === 'boolean' ? { seniorPrivacyConsent } : {}),
  };
}

export function savePendingOnboarding(payload: PendingOnboardingSubmission): void {
  if (typeof window === 'undefined') return;
  const normalized = normalizePendingSubmission(payload);
  localStorage.setItem(PENDING_ONBOARDING_STORAGE_KEY, JSON.stringify(normalized));
}

export function loadPendingOnboarding(): PendingOnboardingSubmission | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(PENDING_ONBOARDING_STORAGE_KEY);
  if (!raw) return null;

  try {
    return normalizePendingSubmission(JSON.parse(raw) as PendingOnboardingSubmission);
  } catch {
    return null;
  }
}

export function clearPendingOnboarding(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PENDING_ONBOARDING_STORAGE_KEY);
}

export async function submitPendingOnboarding(
  payload: PendingOnboardingSubmission,
): Promise<OnboardingSubmissionResult> {
  const normalized = normalizePendingSubmission(payload);
  const onboardingResult = await completeOnboarding(normalized.onboarding);

  if (normalized.onboarding.user_type === 'mentor' && normalized.seniorCareer) {
    await saveCareerContact(normalized.seniorCareer.contact);
    await saveCareerSkills(normalized.seniorCareer.skills);
    await saveCareerWorks(normalized.seniorCareer.works);
    await saveCareerEducations(normalized.seniorCareer.educations);
    await saveCareerMentorQnA(normalized.seniorCareer.mentor_qna);
  }

  return {
    user: onboardingResult.user,
    subscribedBoards: onboardingResult.subscribed_boards,
  };
}
