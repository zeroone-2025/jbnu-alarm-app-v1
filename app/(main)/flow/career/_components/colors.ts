// 카드 내부 컬러 회전 / 카테고리 색상 매핑 (정적 클래스명만 사용 — Tailwind 빌드 친화적)

export const PILL_COLORS = [
  'purple',
  'blue',
  'indigo',
  'cyan',
  'emerald',
  'amber',
  'rose',
] as const;

export type PillColor = (typeof PILL_COLORS)[number];

export function pickPillColor(index: number): PillColor {
  return PILL_COLORS[index % PILL_COLORS.length];
}

const PILL_BG_TEXT_BORDER: Record<PillColor, string> = {
  purple: 'bg-purple-50 text-purple-700 border-purple-100',
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  rose: 'bg-rose-50 text-rose-700 border-rose-100',
};

export function pillClasses(color: PillColor) {
  return PILL_BG_TEXT_BORDER[color];
}

const SQUARE_BG_TEXT: Record<PillColor, string> = {
  purple: 'bg-purple-500 text-white',
  blue: 'bg-blue-500 text-white',
  indigo: 'bg-indigo-500 text-white',
  cyan: 'bg-cyan-500 text-white',
  emerald: 'bg-emerald-500 text-white',
  amber: 'bg-amber-500 text-white',
  rose: 'bg-rose-500 text-white',
};

export function squareClasses(color: PillColor) {
  return SQUARE_BG_TEXT[color];
}

// 수상 등급별 색상 (이름 키워드 기반 자동 선택)
export type AwardTier = 'gold' | 'silver' | 'bronze' | 'special';

export function inferAwardTier(name: string): AwardTier {
  const n = name.replace(/\s/g, '');
  if (/(대상|최우수|금상|1등|우승)/.test(n)) return 'gold';
  if (/(우수상|은상|2등|준우승)/.test(n)) return 'silver';
  if (/(장려상|동상|3등)/.test(n)) return 'bronze';
  return 'special';
}

export const AWARD_TIER_STYLE: Record<
  AwardTier,
  { bg: string; medalBg: string; medalEmoji: string; subText: string }
> = {
  gold: {
    bg: 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-100',
    medalBg: 'bg-yellow-400',
    medalEmoji: '🥇',
    subText: 'text-yellow-700',
  },
  silver: {
    bg: 'bg-gray-50 border border-gray-100',
    medalBg: 'bg-gray-300',
    medalEmoji: '🥈',
    subText: 'text-gray-500',
  },
  bronze: {
    bg: 'bg-orange-50/60 border border-orange-100',
    medalBg: 'bg-orange-400',
    medalEmoji: '🥉',
    subText: 'text-orange-700',
  },
  special: {
    bg: 'bg-blue-50/60 border border-blue-100',
    medalBg: 'bg-blue-400',
    medalEmoji: '⭐',
    subText: 'text-blue-700',
  },
};

// 글자에서 첫 2글자(영문은 대문자, 그 외는 첫 글자) 약자 추출
export function makeAbbrev(text: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  // 영문이면 단어 첫 글자 2개
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (/^[A-Za-z0-9]/.test(trimmed) && words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (/^[A-Za-z]/.test(trimmed)) {
    return trimmed.slice(0, 2).toUpperCase();
  }
  // 한글이면 첫 1~2글자
  return trimmed.slice(0, 2);
}

// 이름 해시 → 색상 인덱스 (경험 카드 좌측 박스 색상 결정에 사용)
export function hashColorIndex(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % PILL_COLORS.length;
}
