// 학과/단과대 관련 타입 정의

export interface Department {
    id: number;
    dept_code: string;
    dept_name: string;
    college_name: string | null;
    school: string;
}

export interface DepartmentSearchResponse {
    departments: Department[];
    total: number;
}
