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

export interface TimetableAnalysisResponse {
  timetable: TimetableData;
  /** 수강편람 매칭 성공 비율 (0.0~1.0) */
  confidence: number;
  /** 매칭 실패 수업 안내 등 경고 메시지 */
  warnings: string[];
}
