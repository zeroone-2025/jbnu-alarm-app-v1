export interface CompanyBenefit {
  id: number;
  icon: string;
  label: string;
  color: string;
  sort_order: number;
}

export interface CompanyInterviewQA {
  id: number;
  question: string;
  answer: string;
  color: string;
  sort_order: number;
}

export interface CompanyInterview {
  id: number;
  interviewer_name: string;
  interviewer_initial: string;
  interviewer_role: string;
  interviewer_years: number | null;
  sort_order: number;
  qas: CompanyInterviewQA[];
}

export interface CompanyProject {
  id: number;
  title: string;
  client: string | null;
  year: string | null;
  icon: string | null;
  color: string;
  sort_order: number;
}

export interface CompanyOpening {
  id: number;
  title: string;
  department: string | null;
  tags: string | null;            // CSV: "병역특례,신입/경력"
  posted_at: string | null;       // ISO datetime
  external_url: string | null;
  is_open: boolean;
  sort_order: number;
}

export interface CompanyPhoto {
  id: number;
  url: string;
  caption: string | null;
  sort_order: number;
}

export interface CompanyInterestSummary {
  is_interested: boolean;
  reason: string | null;
  updated_at: string;
}

export interface CompanyListItem {
  id: number;
  name: string;
  name_en: string | null;
  slogan: string | null;
  industry: string | null;
  location: string | null;
  employee_count: number | null;
  logo_letter: string | null;
  logo_color: string | null;
}

export interface CompanyDetail extends CompanyListItem {
  description: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  instagram_url: string | null;
  naver_blog_url: string | null;
  benefits: CompanyBenefit[];
  interviews: CompanyInterview[];
  projects: CompanyProject[];
  openings: CompanyOpening[];
  photos: CompanyPhoto[];
  my_interest: CompanyInterestSummary | null;
}

export interface CompanyInterestRequest {
  is_interested: boolean;
  reason: string | null;
}

export interface CompanyInterestResponse {
  id: number;
  company_id: number;
  is_interested: boolean;
  reason: string | null;
  updated_at: string;
}
