import { Notice, markNoticeAsRead, toggleNoticeFavorite } from '@/_lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { Dispatch, SetStateAction } from 'react';

/**
 * 공지사항 액션(읽음, 즐겨찾기)을 관리하는 Hook
 * - Optimistic Update 패턴 사용
 * - 실패 시 자동 롤백
 */
export function useNoticeActions(
  isLoggedIn: boolean,
  setKeywordNotices: Dispatch<SetStateAction<Notice[]>>
) {
  const queryClient = useQueryClient();

  // 공지사항 상태 업데이트 유틸리티
  const updateNoticeState = (
    noticeId: number,
    updater: (notice: Notice) => Notice
  ) => {
    // 키워드 공지 상태 업데이트
    setKeywordNotices((prevNotices) =>
      prevNotices.map((notice) => (notice.id === noticeId ? updater(notice) : notice))
    );

    // React Query 캐시 업데이트 (일반 공지사항)
    queryClient.setQueriesData({ queryKey: ['notices', 'infinite'] }, (oldData: any) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          items: page.items.map((notice: Notice) =>
            notice.id === noticeId ? updater(notice) : notice
          ),
        })),
      };
    });
  };

  /**
   * 공지사항 읽음 처리 (Optimistic Update)
   * 1. UI를 먼저 즉시 업데이트 (사용자 경험 향상)
   * 2. 백엔드 API 호출 (로그인 사용자만)
   * 3. 실패 시 롤백
   */
  const handleMarkAsRead = async (noticeId: number) => {
    // 비로그인 사용자: API 호출 차단 (401 에러 방지)
    if (!isLoggedIn) {
      return;
    }

    // 1. Optimistic Update: 즉시 UI 업데이트
    updateNoticeState(noticeId, (notice) => ({ ...notice, is_read: true }));

    // 2. 백엔드 API 호출 (로그인 사용자만)
    try {
      await markNoticeAsRead(noticeId);
      // 성공 시 이미 UI가 업데이트되어 있으므로 추가 작업 불필요
    } catch (error) {
      // 3. 실패 시 롤백: 원래 상태로 복구
      console.error('Failed to mark notice as read:', error);
      updateNoticeState(noticeId, (notice) => ({ ...notice, is_read: false }));
    }
  };

  /**
   * 즐겨찾기 토글 (Optimistic Update)
   * 1. UI를 먼저 즉시 업데이트
   * 2. 백엔드 API 호출 (로그인 사용자만)
   * 3. 실패 시 롤백
   */
  const handleToggleFavorite = async (noticeId: number) => {
    // 비로그인 사용자: 로그인 유도 후 차단 (401 에러 방지)
    if (!isLoggedIn) {
      alert('로그인 후 사용할 수 있는 기능입니다.');
      return;
    }

    // 1. Optimistic Update: 즉시 UI 업데이트 (토글)
    updateNoticeState(noticeId, (notice) => ({ ...notice, is_favorite: !notice.is_favorite }));

    // 2. 백엔드 API 호출 (로그인 사용자만)
    try {
      await toggleNoticeFavorite(noticeId);
      // 성공 시 이미 UI가 업데이트되어 있으므로 추가 작업 불필요
    } catch (error) {
      // 3. 실패 시 롤백: 원래 상태로 복구
      console.error('Failed to toggle favorite:', error);
      updateNoticeState(noticeId, (notice) => ({ ...notice, is_favorite: !notice.is_favorite }));
    }
  };

  return {
    handleMarkAsRead,
    handleToggleFavorite,
  };
}
