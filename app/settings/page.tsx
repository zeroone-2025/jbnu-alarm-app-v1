'use client';

import { getSortedCategoryGroups, getAllCategoryIds } from '@/lib/categories';
import { useSelectedCategories } from '@/hooks/useSelectedCategories';
import CategoryAccordion from '@/components/CategoryAccordion';

export default function SettingsPage() {
  const {
    selectedCategories,
    toggleCategory,
    selectAll,
    deselectAll,
    isLoading,
  } = useSelectedCategories();

  const categoryGroups = getSortedCategoryGroups();

  // 전체 선택 가능한 항목 수 계산
  const totalAvailableCategories = getAllCategoryIds().length;
  const isAllSelected = selectedCategories.length === totalAvailableCategories;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden bg-gray-50">
      {/* 반응형 컨테이너 */}
      <div className="mx-auto flex h-full w-full max-w-md flex-col border-x border-gray-100 bg-white shadow-xl transition-all md:max-w-4xl">
        {/* 헤더 */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-5">
          <h1 className="text-xl font-bold text-gray-800">⚙️ 알림 설정</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={isAllSelected ? deselectAll : selectAll}
              className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
            >
              {isAllSelected ? '전체 해제' : '전체 선택'}
            </button>
          </div>
        </header>

        {/* 설명 */}
        <div className="shrink-0 bg-blue-50 px-5 py-3">
          <p className="text-sm text-blue-700">
            홈 화면에 표시할 알림 카테고리를 선택하세요
          </p>
          <p className="mt-1 text-xs text-blue-600">
            선택된 {selectedCategories.length}개 / 전체{' '}
            {totalAvailableCategories}개
          </p>
        </div>

        {/* Accordion 리스트 */}
        <div className="flex-1 overflow-y-auto">
          {categoryGroups.map((group) => (
            <CategoryAccordion
              key={group.id}
              group={group}
              selectedCategories={selectedCategories}
              onToggle={toggleCategory}
            />
          ))}
        </div>

        {/* 안내 메시지 */}
        <div className="shrink-0 border-t border-gray-100 bg-gray-50 px-5 py-3">
          <p className="text-center text-xs text-gray-400">
            설정은 자동으로 저장됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
