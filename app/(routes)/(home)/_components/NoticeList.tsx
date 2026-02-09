import { Notice } from '@/_lib/api';
import NoticeCard from './NoticeCard';

interface NoticeListProps {
  loading: boolean;
  selectedCategories: string[];
  filteredNotices: Notice[];
  showKeywordPrefix?: boolean;
  onMarkAsRead: (noticeId: number) => void;
  onToggleFavorite?: (noticeId: number) => void;
  isInFavoriteTab?: boolean;
  isLoggedIn?: boolean;
  onOpenBoardFilter?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  emptyMessage?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyActionClick?: () => void;
  emptyStateVariant?: 'default' | 'error' | 'keyword';
  highlightedIds?: number[]; // 강조 표시할 공지 ID 목록
}

export default function NoticeList({
  loading,
  selectedCategories,
  filteredNotices,
  showKeywordPrefix,
  onMarkAsRead,
  onToggleFavorite,
  isInFavoriteTab,
  isLoggedIn,
  onOpenBoardFilter,
  onShowToast,
  emptyMessage = '표시할 공지사항이 없어요',
  emptyDescription,
  emptyActionLabel,
  onEmptyActionClick,
  emptyStateVariant = 'default',
  highlightedIds = [],
}: NoticeListProps) {
  const emptyMessageClass =
    emptyStateVariant === 'error' ? 'text-red-500' : 'text-gray-400';
  const emptyDescriptionClass =
    emptyStateVariant === 'error' ? 'text-red-400' : 'text-gray-400';
  const emptyActionButtonClass = emptyStateVariant === 'error'
    ? 'mt-4 rounded-lg bg-red-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 active:scale-95'
    : emptyStateVariant === 'keyword'
      ? 'mt-4 rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600 active:scale-95'
      : 'mt-4 rounded-lg bg-blue-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 active:scale-95';

  return (
    <div className="min-h-full p-0 bg-gray-50 md:p-5" role="list">
      <div className="divide-y divide-gray-100 md:grid md:grid-cols-1 md:gap-4 md:divide-y-0">
        {loading ? (
          // 로딩 스켈레톤 UI
          [...Array(6)].map((_, i) => (
            <div
              key={i}
              role="listitem"
              className="p-5 bg-white animate-pulse md:rounded-xl md:border md:border-gray-100 md:shadow-sm"
            >
              <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded"></div>
              <div className="w-1/4 h-3 bg-gray-100 rounded"></div>
            </div>
          ))
        ) : selectedCategories.length === 0 ? (
          // 선택된 게시판이 없을 때
          <div className="flex flex-col items-center justify-center py-20 text-center col-span-full">
            <div className="text-6xl">📭</div>
            <p className="mt-4 text-base font-medium text-gray-500">선택된 게시판이 없어요</p>
            <button
              onClick={onOpenBoardFilter}
              className="mt-4 rounded-lg bg-blue-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 active:scale-95"
            >
              게시판 선택하기
            </button>
          </div>
        ) : filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              showKeywordPrefix={showKeywordPrefix}
              onMarkAsRead={onMarkAsRead}
              onToggleFavorite={onToggleFavorite}
              isInFavoriteTab={isInFavoriteTab}
              isLoggedIn={isLoggedIn}
              onShowToast={onShowToast}
              isHighlighted={highlightedIds.includes(notice.id)}
            />
          ))
        ) : (
          // 필터링 결과 데이터가 없을 때
          <div className="py-20 text-center col-span-full">
            <p className={emptyMessageClass}>{emptyMessage}</p>
            {emptyDescription && (
              <p className={`mt-2 text-sm ${emptyDescriptionClass}`}>{emptyDescription}</p>
            )}
            {emptyActionLabel && onEmptyActionClick && (
              <button
                onClick={onEmptyActionClick}
                className={emptyActionButtonClass}
              >
                {emptyActionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
