import { useState, useEffect } from 'react';
import { BOARD_LIST } from '@/constants/boards';
import { getUserSubscriptions, updateUserSubscriptions } from '@/api';

const STORAGE_KEY = 'my_subscribed_categories'; // 온보딩과 동일한 키 사용

/**
 * 선택된 카테고리를 관리하는 hook
 *
 * 로그인 상태:
 * 1. 로그인: 백엔드 API에서 구독 정보 가져오기 → DB에 저장
 * 2. 비로그인: 빈 배열 반환 (page.tsx에서 home_campus로 fallback)
 */
export function useSelectedCategories() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로딩: 백엔드 API 또는 localStorage에서 불러오기
  useEffect(() => {
    const loadCategories = async () => {
      const token = localStorage.getItem('accessToken');

      if (token) {
        // 로그인 상태: 백엔드 API에서 구독 정보 가져오기
        try {
          const subscriptions = await getUserSubscriptions();
          const boardCodes = subscriptions.map(sub => sub.board_code);
          setSelectedCategories(boardCodes);

          // localStorage에도 동기화 (설정 페이지에서 사용)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(boardCodes));
        } catch (error) {
          console.error('Failed to load subscriptions from API:', error);
          // API 실패 시 빈 배열 (page.tsx에서 home_campus로 fallback)
          setSelectedCategories([]);
        }
      } else {
        // 비로그인 상태: API 호출하지 않고 빈 배열 반환
        // page.tsx에서 게스트 모드는 home_campus로 처리됨
        setSelectedCategories([]);
      }

      setIsLoading(false);
    };

    loadCategories();
  }, []);

  // 선택 변경 시 백엔드 DB에 저장 (Optimistic Update)
  const updateSelectedCategories = async (categories: string[]) => {
    const previousCategories = selectedCategories;

    // 1. UI 먼저 업데이트 (Optimistic Update)
    setSelectedCategories(categories);

    // 2. 백엔드 API 호출
    try {
      await updateUserSubscriptions(categories);
      // 성공 시 localStorage에도 캐시 저장
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error('Failed to save subscriptions to backend:', error);
      // 3. 실패 시 롤백
      setSelectedCategories(previousCategories);
      alert('설정 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 카테고리 토글
  const toggleCategory = async (categoryId: string) => {
    const previousCategories = selectedCategories;
    const newSelection = previousCategories.includes(categoryId)
      ? previousCategories.filter((id) => id !== categoryId)
      : [...previousCategories, categoryId];

    // 1. UI 먼저 업데이트
    setSelectedCategories(newSelection);

    // 2. 백엔드 API 호출
    try {
      await updateUserSubscriptions(newSelection);
      // 성공 시 localStorage에도 캐시 저장
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSelection));
    } catch (error) {
      console.error('Failed to save subscriptions to backend:', error);
      // 3. 실패 시 롤백
      setSelectedCategories(previousCategories);
      alert('설정 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 전체 선택
  const selectAll = async () => {
    await updateSelectedCategories(BOARD_LIST.map((board) => board.id));
  };

  // 전체 해제
  const deselectAll = async () => {
    await updateSelectedCategories([]);
  };

  return {
    selectedCategories,
    isLoading,
    updateSelectedCategories,
    toggleCategory,
    selectAll,
    deselectAll,
  };
}
