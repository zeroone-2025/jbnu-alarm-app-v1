import { useState, useEffect } from 'react';
import { getAllCategoryIds } from '@/lib/categories';

const STORAGE_KEY = 'selected-categories';

/**
 * 선택된 카테고리를 localStorage에서 관리하는 hook
 * 기본값: 모든 카테고리 선택됨
 */
export function useSelectedCategories() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로딩: localStorage에서 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSelectedCategories(JSON.parse(saved));
      } else {
        // 저장된 값이 없으면 모든 카테고리 선택
        setSelectedCategories(getAllCategoryIds());
      }
    } catch (error) {
      console.error('Failed to load selected categories:', error);
      // 에러 발생 시 모든 카테고리 선택
      setSelectedCategories(getAllCategoryIds());
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
