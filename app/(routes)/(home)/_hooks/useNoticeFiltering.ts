import { useMemo } from 'react';
import { Notice } from '@/_lib/api';
import { mergeNoticesForAll } from '@/_lib/utils/notice';
import { FilterType } from '@/_types/filter';

/**
 * 공지사항 필터링 로직을 관리하는 Hook
 * - 게시판 필터링
 * - 키워드 공지 병합
 * - 카테고리 필터 적용 (안읽음, 즐겨찾기)
 */
export function useNoticeFiltering(
  notices: Notice[],
  keywordNotices: Notice[],
  selectedBoards: string[],
  isLoggedIn: boolean,
  filter: FilterType
) {
  // 게시판 필터링
  // - 로그인 사용자: 백엔드에서 이미 구독 게시판만 필터링해서 보냄
  // - 비로그인 사용자: 백엔드에서 모든 공지 보냄 → 프론트엔드에서 selectedBoards로 필터링
  const boardFilteredNotices = useMemo(() => {
    return isLoggedIn
      ? notices
      : notices.filter((notice) => selectedBoards.includes(notice.board_code));
  }, [notices, isLoggedIn, selectedBoards]);

  // 최종 필터링
  const filteredNotices = useMemo<Notice[]>(() => {
    // 1단계: 게시판/키워드 필터링
    let result: Notice[] = boardFilteredNotices;
    
    if (filter === 'KEYWORD') {
      result = keywordNotices;
    } else if (filter === 'ALL') {
      result = mergeNoticesForAll(boardFilteredNotices, keywordNotices);
    }

    // 2단계: 카테고리 필터 적용
    if (filter === 'UNREAD') {
      result = result.filter((notice) => !notice.is_read);
    } else if (filter === 'FAVORITE') {
      result = result.filter((notice) => notice.is_favorite);
      result = [...result].sort(
        (a, b) =>
          new Date(b.favorite_created_at ?? 0).getTime()
          - new Date(a.favorite_created_at ?? 0).getTime()
      );
    }

    return result;
  }, [boardFilteredNotices, keywordNotices, filter]);

  return { filteredNotices };
}
