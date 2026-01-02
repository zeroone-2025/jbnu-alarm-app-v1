import { useState, useEffect } from 'react';
import { getAllCategoryIds } from '@/lib/categories';

const STORAGE_KEY = 'my_subscribed_categories'; // 온보딩과 동일한 키 사용

/**
 * 선택된 카테고리를 localStorage에서 관리하는 hook
 *
 * 초기값:
 * 1. localStorage에 'my_subscribed_categories'가 있으면 사용 (온보딩 완료)
 * 2. 없으면 빈 배열 (온보딩 필요)
 */
export function useSelectedCategories() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로딩: localStorage에서 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        // 온보딩 완료: 저장된 구독 카테고리 사용
        setSelectedCategories(JSON.parse(saved));
      } else {
        // 온보딩 미완료: 빈 배열 (page.tsx에서 온보딩 모달 표시)
        setSelectedCategories([]);
      }
    } catch (error) {
      console.error('Failed to load selected categories:', error);
      setSelectedCategories([]);
    } finally {
      setIsLoading(false);
    }
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
