'use client';

import { FiSliders } from 'react-icons/fi';

interface CategoryFilterProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  isLoggedIn: boolean; // 로그인 상태
  onSettingsClick: () => void; // 설정 버튼 클릭 콜백
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void; // 토스트 메시지 표시
}

// 전체 필터 목록 (Guest/User 공통)
const ALL_FILTERS = [
  { key: 'ALL', label: '전체' },
  { key: 'UNREAD', label: '안 읽음' },
  { key: 'LATEST', label: '최신 공지' },
  { key: 'FAVORITE', label: '즐겨 찾기' },
];

// 로그인 필요 필터 목록
const LOGIN_REQUIRED_FILTERS = ['UNREAD', 'LATEST', 'FAVORITE'];

export default function CategoryFilter({ activeFilter, onFilterChange, isLoggedIn, onSettingsClick, onShowToast }: CategoryFilterProps) {
  const handleSettingsClick = () => {
    // Guest/User 모두 설정 모달 열기 (Guest는 localStorage 저장)
    onSettingsClick();
  };

  const handleFilterClick = (filterKey: string) => {
    // 비로그인 사용자가 제한된 필터를 클릭하면 로그인 유도
    if (!isLoggedIn && LOGIN_REQUIRED_FILTERS.includes(filterKey)) {
      onShowToast('로그인 후 사용할 수 있는 기능입니다.', 'info');
      return;
    }
    // 허용된 필터 또는 로그인 사용자: 필터 변경
    onFilterChange(filterKey);
  };

  return (
    <div className="flex w-full items-center gap-2 bg-gray-50 px-4 py-2">
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
        {ALL_FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;

          return (
            <button
              key={filter.key}
              onClick={() => handleFilterClick(filter.key)}
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
