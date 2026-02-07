import { useState, useEffect } from 'react';
import { FiSliders, FiX } from 'react-icons/fi';

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
  { key: 'KEYWORD', label: '키워드' },
  { key: 'FAVORITE', label: '즐겨찾기' },
];

// 로그인 필요 필터 목록
const LOGIN_REQUIRED_FILTERS = ['UNREAD', 'KEYWORD', 'FAVORITE'];

export default function CategoryFilter({ activeFilter, onFilterChange, isLoggedIn, onSettingsClick, onShowToast }: CategoryFilterProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // 첫 방문 여부 확인 (localStorage)
    const hasSeenTooltip = localStorage.getItem('hasSeenFilterTooltip');
    if (!hasSeenTooltip) {
      setShowTooltip(true);
    }
  }, []);

  const handleSettingsClick = () => {
    // 툴팁 닫기 및 다시 보지 않음 설정
    if (showTooltip) {
      setShowTooltip(false);
      localStorage.setItem('hasSeenFilterTooltip', 'true');
    }
    onSettingsClick();
  };

  const closeTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip(false);
    localStorage.setItem('hasSeenFilterTooltip', 'true');
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
      <div className="relative shrink-0 flex items-center gap-2">
        <button
          onClick={handleSettingsClick}
          className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white p-1.5 text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md active:scale-95"
          aria-label="필터 설정"
        >
          <FiSliders size={18} className="text-gray-600" />
        </button>

        {/* 툴팁 */}
        {showTooltip && (
          <div className="absolute top-12 left-0 z-10 animate-fadeIn">
            <div className="relative flex items-center gap-2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white shadow-lg">
              <span>내 학과를 선택하고 더 많은 정보를 확인하세요</span>
              <button
                onClick={closeTooltip}
                className="rounded-full p-0.5 hover:bg-gray-700"
              >
                <FiX size={12} />
              </button>
              {/* 툴팁 화살표 (위쪽으로 향함) */}
              <div className="absolute -top-1 left-4 h-2 w-2 rotate-45 bg-gray-900" />
            </div>
          </div>
        )}
      </div>

      {/* 필터 칩 목록 (가로 스크롤 가능) */}
      <div className="flex flex-1 overflow-x-auto no-scrollbar justify-start gap-2 py-0.5">
        {ALL_FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;

          return (
            <button
              key={filter.key}
              onClick={() => handleFilterClick(filter.key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95 ${isActive
                ? 'bg-gray-900 text-white shadow-md'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
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
