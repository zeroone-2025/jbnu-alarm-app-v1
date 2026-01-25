import api from './client';
import type { Department, DepartmentSearchResponse } from '@/_types/department';

/**
 * 학과 검색 (학과만, 단과대 제외)
 */
export const searchDepartments = async (query?: string) => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    
    const response = await api.get<DepartmentSearchResponse>('/departments/search', {
        params: query ? { query } : {},
    });
    return response.data;
};

/**
 * 전체 학과 목록 조회
 */
export const getAllDepartments = async (onlyDept: boolean = true) => {
    const response = await api.get<Department[]>('/departments', {
        params: { only_dept: onlyDept },
    });
    return response.data;
};
