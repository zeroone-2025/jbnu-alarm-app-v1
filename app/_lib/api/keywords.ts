import api from './client';
import type { Keyword, DeleteKeywordResponse } from '@/_types/keyword';
import type { Notice } from '@/_types/notice';

// 내 키워드 조회
export const getMyKeywords = async () => {
    const response = await api.get<Keyword[]>('/users/me/keywords');
    return response.data;
};

// 키워드 추가
export const addKeyword = async (keyword: string) => {
    const response = await api.post<Keyword>('/users/me/keywords', { keyword });
    return response.data;
};

// 키워드 삭제
export const deleteKeyword = async (keywordId: number) => {
    const response = await api.delete<DeleteKeywordResponse>(`/users/me/keywords/${keywordId}`);
    return response.data;
};

// 키워드 공지 목록 조회
export const getKeywordNotices = async (
    page: number = 0,
    limit: number = 20,
    includeRead: boolean = true,
) => {
    const response = await api.get<Notice[]>('/users/me/keyword-notices', {
        params: {
            skip: page * limit,
            limit,
            include_read: includeRead,
        },
    });
    return response.data;
};
