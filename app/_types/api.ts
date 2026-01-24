// API 공통 타입 정의

// 공통 에러 응답
export interface ApiError {
    message: string;
    detail?: string;
    status?: number;
}

// 공통 성공 응답
export interface ApiSuccessResponse {
    message: string;
}

// 페이지네이션 파라미터
export interface PaginationParams {
    skip?: number;
    limit?: number;
}

// 커서 기반 페이지네이션 파라미터
export interface CursorPaginationParams {
    cursor?: string | null;
    limit?: number;
}
