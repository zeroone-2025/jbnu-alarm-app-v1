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

function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[()\-_/]/g, '');
}

function stripDepartmentSuffix(text: string): string {
  return text.replace(/(학과|학부|전공|계열)$/g, '');
}

/**
 * 검색 최적화 매칭 점수 계산
 * 0: 매칭 안됨, 높을수록 높은 우선순위
 */
export function getSearchScore(target: string, query: string): number {
  const normalizedTarget = normalizeForSearch(target);
  const normalizedQuery = normalizeForSearch(query);

  if (!normalizedQuery) return 0;

  // 1. 완전 일치 (최상위)
  if (normalizedTarget === normalizedQuery) return 120;

  // 2. 시작 부분 일치
  if (normalizedTarget.startsWith(normalizedQuery)) return 95;

  // 3. 중간 포함 일치
  if (normalizedTarget.includes(normalizedQuery)) return 75;

  // 4. 학과/학부/전공/계열 접미어 제거 후 일치
  const targetWithoutSuffix = stripDepartmentSuffix(normalizedTarget);
  const queryWithoutSuffix = stripDepartmentSuffix(normalizedQuery);
  if (targetWithoutSuffix && queryWithoutSuffix) {
    if (targetWithoutSuffix === queryWithoutSuffix) return 70;
    if (targetWithoutSuffix.startsWith(queryWithoutSuffix)) return 55;
    if (targetWithoutSuffix.includes(queryWithoutSuffix)) return 45;
  }

  // 5. 초성 검색 지원 (한글인 경우)
  const queryChoseong = getChoseong(normalizedQuery);
  const targetChoseong = getChoseong(normalizedTarget);

  if (targetChoseong.includes(queryChoseong)) {
    // 초성 시작 일치
    if (targetChoseong.startsWith(queryChoseong)) return 40;
    // 초성 중간 포함
    return 25;
  }

  return 0;
}

/**
 * 배열에서 검색 결과 정렬 및 필터링
 */
export function filterAndSort<T>(
  items: T[],
  query: string,
  keySelector: (item: T) => string | string[]
): T[] {
  if (!query) return [];

  return items
    .map((item) => {
      const keys = keySelector(item);
      const targets = Array.isArray(keys) ? keys : [keys];

      const score = targets.reduce((best, target, idx) => {
        const targetScore = getSearchScore(target, query);
        // 첫 번째 키(주로 학과명)에 가중치 부여
        const weighted = idx === 0 ? targetScore : Math.floor(targetScore * 0.7);
        return Math.max(best, weighted);
      }, 0);

      return { item, score };
    })
    .filter(res => res.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(res => res.item);
}
