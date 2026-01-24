import { Notice } from '@/_lib/api';

/**
 * 공지사항 배열을 병합하고 정렬합니다.
 * - 중복 제거 (id 기준)
 * - 날짜 내림차순 정렬 (최신순)
 */
export function mergeNoticesForAll(primary: Notice[], extra: Notice[]): Notice[] {
  const noticeMap = new Map<number, Notice>();
  
  // primary 공지 먼저 추가
  primary.forEach((notice) => noticeMap.set(notice.id, notice));
  
  // extra 공지 중 중복되지 않은 것만 추가
  extra.forEach((notice) => {
    if (!noticeMap.has(notice.id)) {
      noticeMap.set(notice.id, notice);
    }
  });

  // 날짜별 정렬 (최신순)
  return Array.from(noticeMap.values()).sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return b.id - a.id;
  });
}

/**
 * 키워드 공지사항 배열에서 가장 최신 공지의 시간을 반환합니다.
 */
export function getLatestKeywordNoticeAt(items: Notice[]): number | null {
  if (items.length === 0) return null;
  
  return items
    .map((notice) => new Date(notice.created_at ?? notice.date).getTime())
    .reduce((latest, current) => (current > latest ? current : latest), 0);
}

/**
 * 공지사항을 날짜순으로 정렬합니다 (최신순).
 */
export function sortNoticesByDate(notices: Notice[]): Notice[] {
  return [...notices].sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return b.id - a.id;
  });
}
