import { Notice } from '@/api';
import Link from 'next/link';
import NoticeCard from './NoticeCard';

interface NoticeListProps {
  loading: boolean;
  selectedCategories: string[];
  filteredNotices: Notice[];
  onRefresh: () => void;
  onMarkAsRead: (noticeId: number) => void;
  onToggleFavorite?: (noticeId: number) => void;
  isInFavoriteTab?: boolean;
}

export default function NoticeList({
  loading,
  selectedCategories,
  filteredNotices,
  onRefresh,
  onMarkAsRead,
  onToggleFavorite,
  isInFavoriteTab,
}: NoticeListProps) {
  return (
    <ul className="flex-1 overflow-y-auto bg-gray-50 p-0 md:p-5">
      <div className="divide-y divide-gray-100 md:grid md:grid-cols-1 md:gap-4 md:divide-y-0">
        {loading ? (
          // 로딩 스켈레톤 UI
          [...Array(6)].map((_, i) => (
            <li
              key={i}
              className="animate-pulse bg-white p-5 md:rounded-xl md:border md:border-gray-100 md:shadow-sm"
            >
              <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-3 w-1/4 rounded bg-gray-100"></div>
            </li>
          ))
        ) : selectedCategories.length === 0 ? (
          // 선택된 카테고리가 없을 때
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl">📭</div>
            <p className="mt-4 text-gray-400">선택된 알림 카테고리가 없습니다</p>
            <Link
              href="/settings"
              className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
            >
              설정에서 카테고리 선택하기
            </Link>
          </div>
        ) : filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              onMarkAsRead={onMarkAsRead}
              onToggleFavorite={onToggleFavorite}
              isInFavoriteTab={isInFavoriteTab}
            />
          ))
        ) : (
          // 데이터 없을 때
          <div className="col-span-full py-20 text-center text-gray-400">
            <p>표시할 공지사항이 없어요 😢</p>
            <button
              onClick={onRefresh}
              className="mt-2 text-sm text-blue-500 underline"
            >
              데이터 새로고침
            </button>
          </div>
        )}
      </div>
    </ul>
  );
}
