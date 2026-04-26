// Tailwind safelist 친화적 색상 매핑 (정적 클래스 문자열로만 사용)

export const COMPANY_GRADIENT: Record<string, string> = {
  blue: 'from-blue-600 to-indigo-700',
  indigo: 'from-indigo-600 to-violet-700',
  emerald: 'from-emerald-500 to-teal-600',
  rose: 'from-rose-500 to-pink-600',
  amber: 'from-amber-500 to-orange-600',
  sky: 'from-sky-500 to-blue-600',
};

export const COMPANY_LOGO_TEXT: Record<string, string> = {
  blue: 'text-blue-600',
  indigo: 'text-indigo-600',
  emerald: 'text-emerald-600',
  rose: 'text-rose-600',
  amber: 'text-amber-600',
  sky: 'text-sky-600',
};

export const COMPANY_LOGO_BG: Record<string, string> = {
  blue: 'bg-blue-50',
  indigo: 'bg-indigo-50',
  emerald: 'bg-emerald-50',
  rose: 'bg-rose-50',
  amber: 'bg-amber-50',
  sky: 'bg-sky-50',
};

export const BENEFIT_BG: Record<string, string> = {
  purple: 'bg-purple-100',
  blue: 'bg-blue-100',
  emerald: 'bg-emerald-100',
  amber: 'bg-amber-100',
  rose: 'bg-rose-100',
  sky: 'bg-sky-100',
  indigo: 'bg-indigo-100',
};

export const QA_TEXT: Record<string, string> = {
  blue: 'text-blue-600',
  purple: 'text-purple-600',
  emerald: 'text-emerald-600',
  rose: 'text-rose-600',
  amber: 'text-amber-600',
  indigo: 'text-indigo-600',
};

export const QA_BORDER: Record<string, string> = {
  blue: 'border-blue-300',
  purple: 'border-purple-300',
  emerald: 'border-emerald-300',
  rose: 'border-rose-300',
  amber: 'border-amber-300',
  indigo: 'border-indigo-300',
};

export const QA_STRONG: Record<string, string> = {
  blue: 'text-blue-700',
  purple: 'text-purple-700',
  emerald: 'text-emerald-700',
  rose: 'text-rose-700',
  amber: 'text-amber-700',
  indigo: 'text-indigo-700',
};

export function gradient(color: string | null | undefined) {
  return COMPANY_GRADIENT[color ?? 'blue'] ?? COMPANY_GRADIENT.blue;
}

export function logoText(color: string | null | undefined) {
  return COMPANY_LOGO_TEXT[color ?? 'blue'] ?? COMPANY_LOGO_TEXT.blue;
}

export function logoBg(color: string | null | undefined) {
  return COMPANY_LOGO_BG[color ?? 'blue'] ?? COMPANY_LOGO_BG.blue;
}

export function benefitBg(color: string | null | undefined) {
  return BENEFIT_BG[color ?? 'purple'] ?? BENEFIT_BG.purple;
}

export function qaText(color: string | null | undefined) {
  return QA_TEXT[color ?? 'blue'] ?? QA_TEXT.blue;
}

export function qaBorder(color: string | null | undefined) {
  return QA_BORDER[color ?? 'blue'] ?? QA_BORDER.blue;
}

export function qaStrong(color: string | null | undefined) {
  return QA_STRONG[color ?? 'blue'] ?? QA_STRONG.blue;
}

/**
 * 직원수를 정확한 숫자 대신 범위(bucket)로 표시.
 * 회사 규모는 실시간으로 변하기 때문에 정확한 숫자는 노출하지 않는다.
 */
export function formatEmployeeBucket(count: number | null | undefined): string | null {
  if (count == null) return null;
  if (count < 10) return '10명 이하';
  if (count < 30) return '10~30명';
  if (count < 50) return '30~50명';
  if (count < 100) return '50~100명';
  if (count < 300) return '100~300명';
  return '300명 이상';
}
