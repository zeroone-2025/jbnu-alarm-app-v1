// 키워드 관련 타입 정의

export interface Keyword {
    id: number;
    keyword: string;
    created_at: string;
    board_codes: string[] | null;  // null = 구독 게시판 전체
}

// 키워드 추가 요청
export interface AddKeywordRequest {
    keyword: string;
    board_codes?: string[];
}

// 키워드 삭제 응답
export interface DeleteKeywordResponse {
    message: string;
    keyword_id: number;
}

// 키워드 게시판 범위 수정 응답
export interface UpdateKeywordBoardsResponse {
    message: string;
    keyword_id: number;
    board_codes: string[] | null;
}
