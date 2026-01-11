'use client';

import { FiSliders } from 'react-icons/fi';

interface CategoryFilterProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  isLoggedIn: boolean; // 로그인 상태
  onSettingsClick: () => void; // 설정 버튼 클릭 콜백
}

// 전체 필터 목록
const ALL_FILTERS = [
  { key: 'ALL', label: '전체' },
  { key: 'UNREAD', label: '안 읽음' },
  { key: 'LATEST', label: '최신 공지' },
  { key: 'FAVORITE', label: '즐겨 찾기' },
];

// Guest용 필터 (전체만)
const GUEST_FILTERS = [
  { key: 'ALL', label: '전체' },
];

export default function CategoryFilter({ activeFilter, onFilterChange, isLoggedIn, onSettingsClick }: CategoryFilterProps) {
  const handleSettingsClick = () => {
    if (!isLoggedIn) {
      // Guest일 경우 로그인 유도
      alert('로그인 후 설정을 변경할 수 있습니다.');
      return;
    }
    // 로그인된 사용자: 모달 열기
    onSettingsClick();
  };

  // 로그인 여부에 따라 다른 필터 목록 사용
  const filters = isLoggedIn ? ALL_FILTERS : GUEST_FILTERS;

  return (
    <div className="sticky top-0 z-10 flex w-full items-center gap-2 bg-gray-50 px-4 py-2">
      {/* 좌측 고정 설정 버튼 */}
      <button
        onClick={handleSettingsClick}
        className="shrink-0 rounded-full bg-gray-100 p-1.5 text-gray-700 transition-colors hover:bg-gray-200"
        aria-label="필터 설정"
      >
        <FiSliders size={18} />
      </button>

      {/* 필터 칩 목록 (글자 크기에 따라 자연스럽게) */}
      <div className="flex flex-1 justify-between gap-2">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              onClick={() => onFilterChange(filter.key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-900 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
