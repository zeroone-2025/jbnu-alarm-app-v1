import { useState, useEffect } from 'react';
import { BOARD_LIST, GUEST_FILTER_KEY } from '@/_lib/constants/boards';
import { getUserSubscriptions, updateUserSubscriptions } from '@/_lib/api';
import { useUser } from '@/_lib/hooks/useUser';

const USER_STORAGE_KEY = 'my_subscribed_categories'; // 로그인 사용자 캐시 키
const GUEST_FIXED_BOARD = 'home_campus';

const normalizeGuestCategories = (categories: string[]) => {
  const set = new Set(categories);
  set.add(GUEST_FIXED_BOARD);
  return Array.from(set);
};

/**
 * 선택된 카테고리를 관리하는 hook
 *
 * **하이브리드 저장소 전략:**
 * - Guest (비로그인): localStorage (GUEST_FILTER_KEY)만 사용
 * - User (로그인): DB (API) + localStorage 캐시
 */
export function useSelectedCategories() {
  // SSR-safe: 서버와 클라이언트의 초기 상태를 동일하게 유지
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn, isAuthLoaded } = useUser();

  // 초기 로딩: 로그인 여부에 따라 다른 저장소 사용
  useEffect(() => {
    const loadCategories = async () => {
      // 인증 상태 확인이 안 되었다면 대기
      if (!isAuthLoaded) return;

      // 클라이언트에서만 실행
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      if (isLoggedIn) {
        // ✅ User: 백엔드 API에서 구독 정보 가져오기
        try {
          const subscriptions = await getUserSubscriptions();
          const boardCodes = subscriptions.map(sub => sub.board_code);
          setSelectedCategories(boardCodes);

          // localStorage에 캐시 저장
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(boardCodes));
        } catch (error) {
          console.error('Failed to load subscriptions from API:', error);
          // API 실패 시 빈 배열 (page.tsx에서 home_campus로 fallback)
          setSelectedCategories([]);
        }
      } else {
        // ✅ Guest: localStorage에서만 읽기 (API 호출 차단)
        const saved = localStorage.getItem(GUEST_FILTER_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const normalized = Array.isArray(parsed)
              ? normalizeGuestCategories(parsed)
              : [GUEST_FIXED_BOARD];
            localStorage.setItem(GUEST_FILTER_KEY, JSON.stringify(normalized));
            setSelectedCategories(normalized);
          } catch {
            const defaultCategories = [GUEST_FIXED_BOARD];
            localStorage.setItem(GUEST_FILTER_KEY, JSON.stringify(defaultCategories));
            setSelectedCategories(defaultCategories);
          }
        } else {
          // 저장된 값 없으면 기본값으로 초기화 후 저장
          const defaultCategories = [GUEST_FIXED_BOARD];
          localStorage.setItem(GUEST_FILTER_KEY, JSON.stringify(defaultCategories));
          setSelectedCategories(defaultCategories);
        }
      }

      setIsLoading(false);
    };

    loadCategories();
  }, [isAuthLoaded, isLoggedIn]);

  // 선택 변경: 로그인 여부에 따라 다른 저장소에 저장
  const updateSelectedCategories = async (categories: string[]) => {
    const previousCategories = selectedCategories;

    const normalizedCategories = isLoggedIn
      ? categories
      : normalizeGuestCategories(categories);

    // 1. UI 먼저 업데이트 (Optimistic Update)
    setSelectedCategories(normalizedCategories);

    if (isLoggedIn) {
      // ✅ User: 백엔드 API 호출 (DB 저장)
      try {
        await updateUserSubscriptions(normalizedCategories);
        // 성공 시 localStorage 캐시 저장
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedCategories));
      } catch (error) {
        console.error('Failed to save subscriptions to backend:', error);
        // 실패 시 롤백
        setSelectedCategories(previousCategories);
        alert('설정 저장에 실패했습니다. 다시 시도해주세요.');
      }
    } else {
      // ✅ Guest: localStorage에만 저장 (API 호출 차단)
      try {
        localStorage.setItem(GUEST_FILTER_KEY, JSON.stringify(normalizedCategories));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
        setSelectedCategories(previousCategories);
        alert('설정 저장에 실패했습니다.');
      }
    }
  };

  // 카테고리 토글
  const toggleCategory = async (categoryId: string) => {
    const previousCategories = selectedCategories;
    const newSelection = previousCategories.includes(categoryId)
      ? previousCategories.filter((id) => id !== categoryId)
      : [...previousCategories, categoryId];

    await updateSelectedCategories(newSelection);
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
