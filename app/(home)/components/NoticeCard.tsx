import { Notice } from '@/api';
import { THEME } from '@/theme/theme';
import dayjs from 'dayjs';
import CategoryBadge from '@/components/CategoryBadge';

interface NoticeCardProps {
  notice: Notice;
  onMarkAsRead?: (noticeId: number) => void; // 읽음 처리 콜백 (옵션)
}

export default function NoticeCard({ notice, onMarkAsRead }: NoticeCardProps) {
  // 읽음 상태에 따른 스타일 결정 (하드코딩 금지)
  const styleConfig = notice.is_read
    ? THEME.readState.read
    : THEME.readState.unread;

  // 링크 클릭 시 읽음 처리
  const handleClick = () => {
    if (!notice.is_read && onMarkAsRead) {
      onMarkAsRead(notice.id);
    }
  };

  return (
    <li
      className="bg-white transition-all hover:bg-gray-50 md:rounded-xl md:border md:border-gray-100 md:shadow-sm md:hover:-translate-y-0.5 md:hover:shadow-md"
      style={{ opacity: styleConfig.opacity }}
    >
      <a
        href={notice.link}
        target="_blank"
        rel="noreferrer"
        className="block p-5"
        onClick={handleClick}
      >
        <div className="mb-2 flex items-center gap-2">
          {/* 카테고리 배지 */}
          <CategoryBadge category={notice.category} />

          {/* 날짜 */}
          <span className={`flex items-center gap-1 text-xs ${styleConfig.textColor}`}>
            {notice.date}
            {/* 2일 이내 게시물인 경우 New 표시 (읽음 여부 상관없이 유지) */}
            {dayjs().diff(dayjs(notice.date), 'day') <= 2 && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            )}
          </span>
        </div>

        {/* 제목 */}
        <h3
          className={`text-[15px] font-medium leading-snug ${styleConfig.titleColor}`}
        >
          {notice.title}
        </h3>
      </a>
    </li>
  );
}
