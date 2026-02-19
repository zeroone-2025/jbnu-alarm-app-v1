export interface TimetableClass {
  id: number;
  name: string;
  professor?: string | null;
  location?: string | null;
  day: number;            // 0=월 ~ 6=일
  start_time: string;     // "09:00"
  end_time: string;       // "10:30"
}

export interface TimetableData {
  id: number;
  user_id: number;
  semester: string;
  classes: TimetableClass[];
  created_at: string;
  updated_at: string;
}

/** 자동 인식 실패 수업 — 사용자가 직접 입력해야 함 */
export interface UnmatchedClass {
  name: string;
  day: number | null;
  start_time: string | null;
  end_time: string | null;
  professor: string | null;
  location: string | null;
}

export interface TimetableAnalysisResponse {
  timetable: TimetableData;
  /** 매칭 성공 비율 (0.0~1.0) */
  confidence: number;
  warnings: string[];
  /** 자동 인식 실패 수업 목록 (프론트에서 직접 입력 큐로 표시) */
  unmatched_classes: UnmatchedClass[];
}

export interface ClassDetail {
  class_id: number;
  name: string;
  professor: string | null;
  location: string | null;
  day: number;
  start_time: string;
  end_time: string;
  credits: number | null;
  course_type: string | null;
  class_div: string | null;
  grade_type: string | null;
  dept_name: string | null;
  subject_code: string | null;
  lecture_type: string | null;
  language: string | null;
  capacity: number | null;
  enrolled: number | null;
  hours: number | null;
  target: string | null;
  field_area: string | null;
  field_detail: string | null;
}
