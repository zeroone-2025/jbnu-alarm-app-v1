// Career 관련 타입 정의

export interface CareerProfile {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  visibility: 'public' | 'career_only';
  skill_tags: string[];
  is_mentor: boolean;
  educations: Education[];
  works: WorkExperience[];
  certifications: Certification[];
  activities: Activity[];
  mentor_qna: MentorQnA | null;
}

export interface Education {
  id?: number;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  school: string;
  major: string;
  degree: 'bachelor' | 'master' | 'doctor' | 'associate';
  status: 'enrolled' | 'leave' | 'graduated' | 'completed';
  region: string;
}

export interface WorkExperience {
  id?: number;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  company: string;
  position: string;
  employment_type: 'full_time' | 'contract' | 'intern' | 'freelance' | 'part_time';
  region: string;
}

export interface Certification {
  id?: number;
  name: string;
  date: string | null;
}

export interface Activity {
  id?: number;
  name: string;
  period: string | null;
  description: string | null;
}

export interface MentorQnA {
  targeted_capital: boolean | null;
  reason_for_local: string | null;
  helpful_organizations: string | null;
  local_advantages: string | null;
  local_disadvantages: string | null;
  advice_for_juniors: string | null;
}

export interface CareerContactUpdate {
  name: string | null;
  email: string | null;
  phone: string | null;
  visibility: 'public' | 'career_only';
}

export interface CareerEducationsUpdate {
  educations: Omit<Education, 'id'>[];
}

export interface CareerWorksUpdate {
  works: Omit<WorkExperience, 'id'>[];
}

export interface CareerSkillsUpdate {
  skill_tags: string[];
}

export interface CareerCertificationsUpdate {
  certifications: Omit<Certification, 'id'>[];
}

export interface CareerActivitiesUpdate {
  activities: Omit<Activity, 'id'>[];
}

export interface CareerMentorQnAUpdate {
  mentor_qna: MentorQnA;
}

export const DEGREE_LABELS: Record<Education['degree'], string> = {
  associate: '전문학사',
  bachelor: '학사',
  master: '석사',
  doctor: '박사',
};

export const STATUS_LABELS: Record<Education['status'], string> = {
  enrolled: '재학',
  leave: '휴학',
  graduated: '졸업',
  completed: '수료',
};

export const EMPLOYMENT_TYPE_LABELS: Record<WorkExperience['employment_type'], string> = {
  full_time: '정규직',
  contract: '계약직',
  intern: '인턴',
  freelance: '프리랜서',
  part_time: '파트타임',
};
