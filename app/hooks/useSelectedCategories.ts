import { useState, useEffect } from 'react';
import { getAllCategoryIds } from '@/theme/categories';
import { getUserSubscriptions } from '@/api';

const STORAGE_KEY = 'my_subscribed_categories'; // 온보딩과 동일한 키 사용

/**
 * 선택된 카테고리를 관리하는 hook
 *
 * 로그인 상태:
 * 1. 로그인: 백엔드 API에서 구독 정보 가져오기
 * 2. 비로그인: localStorage 읽기 (사용 안 함, page.tsx에서 무시)
 */
export function useSelectedCategories() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로딩: 백엔드 API 또는 localStorage에서 불러오기
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const token = localStorage.getItem('accessToken');

        if (token) {
          // 로그인 상태: 백엔드 API에서 구독 정보 가져오기
          const subscriptions = await getUserSubscriptions();
          const boardCodes = subscriptions.map(sub => sub.board_code);
          setSelectedCategories(boardCodes);

          // localStorage에도 동기화 (설정 페이지에서 사용)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(boardCodes));
        } else {
          // 비로그인 상태: localStorage 읽기 (page.tsx에서 무시됨)
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            setSelectedCategories(JSON.parse(saved));
          } else {
            setSelectedCategories([]);
          }
        }
      } catch (error) {
        console.error('Failed to load selected categories:', error);
        setSelectedCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // 선택 변경 시 localStorage에 저장
  const updateSelectedCategories = (categories: string[]) => {
    setSelectedCategories(categories);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error('Failed to save selected categories:', error);
    }
  };

  // 카테고리 토글
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const newSelection = prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId];

      // localStorage에 저장
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSelection));
      } catch (error) {
        console.error('Failed to save selected categories:', error);
      }

      return newSelection;
    });
  };

  // 전체 선택
  const selectAll = () => {
    updateSelectedCategories(getAllCategoryIds());
  };

  // 전체 해제
  const deselectAll = () => {
    updateSelectedCategories([]);
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
