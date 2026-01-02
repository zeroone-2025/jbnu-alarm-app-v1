import { Notice } from '@/lib/api';
import dayjs from 'dayjs';
import { FiExternalLink } from 'react-icons/fi';
import CategoryBadge from './CategoryBadge';

interface NoticeCardProps {
  notice: Notice;
}

export default function NoticeCard({ notice }: NoticeCardProps) {
  return (
    <li className="bg-white transition-all hover:bg-gray-50 md:rounded-xl md:border md:border-gray-100 md:shadow-sm md:hover:-translate-y-0.5 md:hover:shadow-md">
      <a
        href={notice.link}
        target="_blank"
        rel="noreferrer"
        className="block p-5"
      >
        <div className="mb-2 flex items-center gap-2">
          {/* 카테고리 배지 */}
          <CategoryBadge category={notice.category} />

          {/* 날짜 */}
          <span className="flex items-center gap-1 text-xs text-gray-400">
            {notice.date}
            {/* 오늘 날짜랑 같으면 New 표시 */}
            {notice.date === dayjs().format('YYYY-MM-DD') && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            )}
          </span>
        </div>

        {/* 제목 */}
        <h3 className="mb-1 line-clamp-2 text-[15px] font-medium leading-snug text-gray-800">
          {notice.title}
        </h3>

        {/* 하단 정보 (몇 시간 전) */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {dayjs(notice.crawled_at).fromNow()} 수집됨
          </span>
          <FiExternalLink className="text-gray-300" size={14} />
        </div>
      </a>
    </li>
  );
}
