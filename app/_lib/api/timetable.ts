import api from './client';
import type {
  TimetableData,
  TimetableAnalysisResponse,
  TimetableClass,
  ClassDetail,
} from '@/_types/timetable';

interface DeleteTimetableClassResponse {
  message: string;
  class_id: number;
  deleted_class_ids?: number[];
}

// 시간표 이미지 업로드 + Gemini 분석
export const uploadTimetableImage = async (file: File, semester?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (semester) {
    formData.append('semester', semester);
  }

  const response = await api.post<TimetableAnalysisResponse>('/timetable/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000, // 120s timeout for AI analysis
  });
  return response.data;
};

// 현재 유저 시간표 조회
export const getUserTimetable = async (semester?: string) => {
  try {
    const response = await api.get<TimetableData>('/timetable', {
      params: semester ? { semester } : {},
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

// 수업/일정 개별 추가
export const addTimetableClass = async (data: {
  name: string;
  professor?: string;
  location?: string;
  day: number;
  start_time: string;
  end_time: string;
}, semester?: string) => {
  const response = await api.post<TimetableClass>('/timetable/classes', data, {
    params: semester ? { semester } : {},
  });
  return response.data;
};

// 수업/일정 개별 삭제
export const deleteTimetableClass = async (classId: number) => {
  const response = await api.delete<DeleteTimetableClassResponse>(`/timetable/classes/${classId}`);
  return response.data;
};

// 시간표 전체 삭제
export const deleteTimetable = async (semester?: string) => {
  const response = await api.delete('/timetable', {
    params: semester ? { semester } : {},
  });
  return response.data;
};

// 수업 상세 정보 조회 (수강편람 연동)
export const getClassDetail = async (classId: number, semester?: string) => {
  const response = await api.get<ClassDetail>(`/timetable/classes/${classId}/detail`, {
    params: semester ? { semester } : {},
  });
  return response.data;
};
