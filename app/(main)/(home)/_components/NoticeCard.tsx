import { Notice, incrementNoticeView } from '@/_lib/api';
import { THEME } from '@/_lib/constants/theme';
import dayjs from 'dayjs';
import CategoryBadge from '@/_components/ui/CategoryBadge';
import { FaStar, FaRegStar } from 'react-icons/fa';

interface NoticeCardProps {
  notice: Notice;
  showKeywordPrefix?: boolean;
  onMarkAsRead?: (noticeId: number) => void; // 읽음 처리 콜백 (옵션)
  onToggleFavorite?: (noticeId: number) => void; // 즐겨찾기 토글 콜백 (옵션)
  isInFavoriteTab?: boolean; // 즐겨찾기 탭 여부 (항상 unread 스타일 표시)
  isLoggedIn?: boolean; // 로그인 여부
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void; // 토스트 메시지 표시
  isHighlighted?: boolean; // 신규 알림 강조 여부
}

export default function NoticeCard({
  notice,
  showKeywordPrefix,
  onMarkAsRead,
  onToggleFavorite,
  isInFavoriteTab,
  isLoggedIn,
  onShowToast,
  isHighlighted,
}: NoticeCardProps) {
  // 읽음 상태에 따른 스타일 결정
  // 즐겨찾기 탭에서는 항상 unread 스타일 표시
  const styleConfig = (isInFavoriteTab || !notice.is_read)
    ? THEME.readState.unread
    : THEME.readState.read;

  // 링크 클릭 시 조회수 증가 + 읽음 처리
  const handleClick = () => {
    // 조회수 증가 (로그인 사용자만 - 401 에러 방지)
    if (isLoggedIn) {
      incrementNoticeView(notice.id).catch(() => { });
    }

    // 읽음 처리 (로그인 사용자만)
    if (!notice.is_read && onMarkAsRead) {
      onMarkAsRead(notice.id);
    }
  };

  // 즐겨찾기 버튼 클릭 (이벤트 전파 중지)
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // 링크 이동 방지
    e.stopPropagation(); // 이벤트 버블링 방지

    // 게스트 모드일 때는 로그인 안내 메시지 표시
    if (!isLoggedIn) {
      if (onShowToast) {
        onShowToast('로그인 후 즐겨찾기를 사용할 수 있습니다.', 'info');
      }
      return;
    }

    if (onToggleFavorite) {
      onToggleFavorite(notice.id);
    }
  };

  const matchedKeywords = showKeywordPrefix && notice.matched_keywords
    ? notice.matched_keywords
    : [];

  return (
    <div
      role="listitem"
      className={`transition-all hover:bg-gray-50 md:rounded-xl md:border md:border-gray-100 md:shadow-sm md:hover:-translate-y-0.5 md:hover:shadow-md ${isHighlighted && !notice.is_read ? 'bg-orange-50 animate-blink-orange' : 'bg-white'}`}
      style={{ opacity: styleConfig.opacity }}
    >
      <a
        href={notice.link}
        target="_blank"
        rel="noreferrer"
        className="block p-5"
        onClick={handleClick}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* 게시판 배지 */}
            <CategoryBadge boardCode={notice.board_code} />

            {/* 날짜 (YYYY-MM-DD 형식만 표시) */}
            <span className={`flex items-center gap-1 text-xs ${styleConfig.textColor}`}>
              {dayjs(notice.date).format('YYYY-MM-DD')}
              {/* 당일 게시물만 New 표시 */}
              {dayjs().isSame(dayjs(notice.date), 'day') && (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              )}
            </span>
          </div>

          {/* 즐겨찾기 버튼 */}
          {onToggleFavorite && (
            <button
              onClick={handleFavoriteClick}
              className="shrink-0 p-1 text-gray-400 transition-colors hover:text-yellow-500"
              aria-label={notice.is_favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            >
              {notice.is_favorite ? (
                <FaStar className="h-4 w-4 text-yellow-500" />
              ) : (
                <FaRegStar className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* 제목 */}
        <h3
          className={`text-[15px] font-medium leading-snug ${styleConfig.titleColor}`}
        >
          {matchedKeywords.length > 0 && (
            <span className="mr-2 inline-flex flex-wrap items-center gap-1">
              {matchedKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-600"
                >
                  {keyword}
                </span>
              ))}
            </span>
          )}
          {notice.title}
        </h3>
      </a>
    </div>
  );
}
