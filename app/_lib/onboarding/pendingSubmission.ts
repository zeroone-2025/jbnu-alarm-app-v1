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

export interface PendingMentorCareerData {
  contact: CareerContactUpdate;
  skills: CareerSkillsUpdate;
  works: CareerWorksUpdate;
  educations: CareerEducationsUpdate;
  mentor_qna: CareerMentorQnAUpdate;
}

export interface PendingOnboardingSubmission {
  onboarding: OnboardingRequest;
  mentorCareer?: PendingMentorCareerData;
}

export interface OnboardingSubmissionResult {
  user: UserProfile;
  subscribedBoards: string[];
}

export function savePendingOnboarding(payload: PendingOnboardingSubmission): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PENDING_ONBOARDING_STORAGE_KEY, JSON.stringify(payload));
}

export function loadPendingOnboarding(): PendingOnboardingSubmission | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(PENDING_ONBOARDING_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PendingOnboardingSubmission;
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
  const onboardingResult = await completeOnboarding(payload.onboarding);

  if (payload.onboarding.user_type === 'mentor' && payload.mentorCareer) {
    await saveCareerContact(payload.mentorCareer.contact);
    await saveCareerSkills(payload.mentorCareer.skills);
    await saveCareerWorks(payload.mentorCareer.works);
    await saveCareerEducations(payload.mentorCareer.educations);
    await saveCareerMentorQnA(payload.mentorCareer.mentor_qna);
  }

  return {
    user: onboardingResult.user,
    subscribedBoards: onboardingResult.subscribed_boards,
  };
}
