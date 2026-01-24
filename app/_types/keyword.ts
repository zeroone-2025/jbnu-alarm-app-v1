// 키워드 관련 타입 정의

export interface Keyword {
    id: number;
    keyword: string;
    created_at: string;
}

// 키워드 추가 요청
export interface AddKeywordRequest {
    keyword: string;
}

// 키워드 삭제 응답
export interface DeleteKeywordResponse {
    message: string;
    keyword_id: number;
}
