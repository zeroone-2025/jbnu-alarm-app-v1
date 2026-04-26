import api from './client';
import type {
  CareerProfile,
  PublicCareerProfile,
  CareerContactUpdate,
  CareerEducationsUpdate,
  CareerWorksUpdate,
  CareerSkillsUpdate,
  CareerCertificationsUpdate,
  CareerActivitiesUpdate,
  CareerLanguageScoresUpdate,
  CareerMentorQnAUpdate,
} from '@/_types/career';

export async function getMyCareer(): Promise<CareerProfile> {
  const { data } = await api.get('/users/me/career');
  return data;
}

export async function getUserCareer(userId: number): Promise<CareerProfile> {
  const { data } = await api.get(`/users/${userId}/career`);
  return data;
}

export async function getPublicCareer(username: string): Promise<PublicCareerProfile> {
  const normalized = username.startsWith('@') ? username.slice(1) : username;
  const { data } = await api.get(`/career/public/${normalized}`);
  return data;
}

export async function saveCareerContact(contactData: CareerContactUpdate): Promise<CareerProfile> {
  const { data } = await api.put('/users/me/career/contact', contactData);
  return data;
}

export async function saveCareerEducations(educationsData: CareerEducationsUpdate): Promise<CareerProfile> {
  const { data } = await api.put('/users/me/career/educations', educationsData);
  return data;
}

export async function saveCareerWorks(worksData: CareerWorksUpdate): Promise<CareerProfile> {
  const { data } = await api.put('/users/me/career/works', worksData);
  return data;
}

export async function saveCareerSkills(skillsData: CareerSkillsUpdate): Promise<CareerProfile> {
  const { data } = await api.put('/users/me/career/skills', skillsData);
  return data;
}

export async function saveCareerCertifications(certificationsData: CareerCertificationsUpdate): Promise<CareerProfile> {
  const { data } = await api.put('/users/me/career/certifications', certificationsData);
  return data;
}

export async function saveCareerActivities(activitiesData: CareerActivitiesUpdate): Promise<CareerProfile> {
  const { data } = await api.put('/users/me/career/activities', activitiesData);
  return data;
}

export async function saveCareerLanguageScores(
  languageScoresData: CareerLanguageScoresUpdate,
): Promise<CareerProfile> {
  const { data } = await api.put('/users/me/career/language-scores', languageScoresData);
  return data;
}

export async function saveCareerMentorQnA(mentorQnAData: CareerMentorQnAUpdate): Promise<CareerProfile> {
  const { data } = await api.put('/users/me/career/mentor-qna', mentorQnAData);
  return data;
}
