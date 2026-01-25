/**
 * 한글 초성 검색 및 검색 최적화 유틸리티
 */

const CHOSEONG = [
  'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

/**
 * 한글 문자열에서 초성을 추출합니다.
 */
export function getChoseong(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) - 44032;
    if (code > -1 && code < 11172) {
      result += CHOSEONG[Math.floor(code / 588)];
    } else {
      result += text.charAt(i);
    }
  }
  return result;
}

/**
 * 검색 최적화 매칭 점수 계산
 * 0: 매칭 안됨, 높을수록 높은 우선순위
 */
export function getSearchScore(target: string, query: string): number {
  const normalizedTarget = target.toLowerCase().replace(/\s/g, '');
  const normalizedQuery = query.toLowerCase().replace(/\s/g, '');

  if (!normalizedQuery) return 0;

  // 1. 완전 일치 (최상위)
  if (normalizedTarget === normalizedQuery) return 100;

  // 2. 시작 부분 일치
  if (normalizedTarget.startsWith(normalizedQuery)) return 80;

  // 3. 중간 포함 일치
  if (normalizedTarget.includes(normalizedQuery)) return 60;

  // 4. 초성 검색 지원 (한글인 경우)
  const queryChoseong = getChoseong(normalizedQuery);
  const targetChoseong = getChoseong(normalizedTarget);

  if (targetChoseong.includes(queryChoseong)) {
    // 초성 시작 일치
    if (targetChoseong.startsWith(queryChoseong)) return 40;
    // 초성 중간 포함
    return 20;
  }

  return 0;
}

/**
 * 배열에서 검색 결과 정렬 및 필터링
 */
export function filterAndSort<T>(
  items: T[],
  query: string,
  keySelector: (item: T) => string
): T[] {
  if (!query) return [];

  return items
    .map(item => ({ item, score: getSearchScore(keySelector(item), query) }))
    .filter(res => res.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(res => res.item);
}
