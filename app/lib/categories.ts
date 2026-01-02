// 계층적 카테고리 설정 시스템
// 새 카테고리를 추가하려면 CATEGORY_GROUPS 배열의 해당 대분류 children에 항목을 추가하세요

export interface CategoryColor {
  bg: string; // 배지 배경색 (예: "bg-emerald-100")
  text: string; // 배지 텍스트색 (예: "text-emerald-700")
  tabActive: string; // 활성 탭 색상 (예: "text-emerald-600")
}

// 하위 카테고리 아이템
export interface CategoryItem {
  id: string; // API category 값과 일치해야 함 (homepage, csai 등)
  label: string; // 화면에 표시될 이름
  color: CategoryColor; // 색상 테마
  available: boolean; // 사용 가능 여부
}

// 대분류 그룹
export interface CategoryGroup {
  id: string; // 대분류 ID
  label: string; // 대분류 이름
  order: number; // 표시 순서 (작을수록 앞에 표시)
  children: CategoryItem[]; // 하위 카테고리 목록
}

// 10개 이상의 카테고리를 위한 색상 팔레트
const COLOR_PALETTE: CategoryColor[] = [
  {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    tabActive: 'text-indigo-600',
  },
  {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    tabActive: 'text-emerald-600',
  },
  {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    tabActive: 'text-amber-600',
  },
  {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    tabActive: 'text-rose-600',
  },
  {
    bg: 'bg-violet-100',
    text: 'text-violet-700',
    tabActive: 'text-violet-600',
  },
  {
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    tabActive: 'text-cyan-600',
  },
  {
    bg: 'bg-pink-100',
    text: 'text-pink-700',
    tabActive: 'text-pink-600',
  },
  {
    bg: 'bg-lime-100',
    text: 'text-lime-700',
    tabActive: 'text-lime-600',
  },
  {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    tabActive: 'text-orange-600',
  },
  {
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    tabActive: 'text-teal-600',
  },
];

// 계층적 카테고리 그룹 설정 (Prefix 기반)
export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'academic',
    label: '학사 알림',
    order: 1,
    children: [
      {
        id: 'academic_main',  // Backend와 일치 (Prefix: academic_)
        label: '본부 공지',
        color: COLOR_PALETTE[0], // indigo
        available: true,
      },
    ],
  },
  {
    id: 'college',
    label: '단과대',
    order: 2,
    children: [], // 준비 중 (예: college_eng, college_biz)
  },
  {
    id: 'department',
    label: '학과',
    order: 3,
    children: [
      {
        id: 'dept_csai',  // Backend와 일치 (Prefix: dept_)
        label: '컴퓨터인공지능학부',
        color: COLOR_PALETTE[1], // emerald
        available: true,
      },
    ],
  },
  {
    id: 'agency',
    label: '사업단',
    order: 4,
    children: [
      {
        id: 'agency_swuniv',  // Backend와 일치 (Prefix: agency_)
        label: 'SW중심대학사업단',
        color: COLOR_PALETTE[2], // amber
        available: true,
      },
    ],
  },
];

// ==================== 카테고리 이름 매핑 (한글) ====================
// 백엔드에서 영어 코드로 들어오는 것을 한글 이름으로 표시
export const CATEGORY_NAME_MAP: Record<string, string> = {
  // 학사 (academic_)
  academic_main: '본부 공지',

  // 단과대 (college_)
  college_eng: '공과대학',
  college_biz: '경영대학',

  // 학과 (dept_)
  dept_csai: '컴퓨터인공지능학부',

  // 사업단 (agency_)
  agency_swuniv: 'SW중심대학사업단',
  agency_bk21: 'BK21사업단',
};

// 헬퍼 함수들

/**
 * 카테고리 ID의 Prefix를 추출
 * 예: "dept_csai" → "dept"
 */
export function getCategoryPrefix(categoryId: string): string {
  const parts = categoryId.split('_');
  return parts[0] || '';
}

/**
 * 특정 Prefix로 시작하는 모든 카테고리 아이템 반환
 * 예: "dept" → [dept_csai, dept_math, ...]
 */
export function getCategoriesByPrefix(prefix: string): CategoryItem[] {
  return getAllCategoryItems().filter((item) =>
    item.id.startsWith(prefix + '_')
  );
}

/**
 * 카테고리 ID가 특정 그룹에 속하는지 Prefix로 확인
 * 예: "dept_csai"가 "department" 그룹인지 확인
 */
export function belongsToGroup(
  categoryId: string,
  groupId: string
): boolean {
  // 그룹 ID를 Prefix로 사용 (academic → academic_, department → dept_)
  const prefixMap: Record<string, string> = {
    academic: 'academic_',
    college: 'college_',
    department: 'dept_',
    agency: 'agency_',
  };

  const prefix = prefixMap[groupId];
  if (!prefix) return false;

  return categoryId.startsWith(prefix);
}

/**
 * 인덱스를 기반으로 색상을 순환하여 반환
 * 카테고리가 10개 이상일 때 색상을 재사용
 */
export function getColorForCategory(index: number): CategoryColor {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

/**
 * 순서대로 정렬된 카테고리 그룹 반환
 */
export function getSortedCategoryGroups(): CategoryGroup[] {
  return [...CATEGORY_GROUPS].sort((a, b) => a.order - b.order);
}

/**
 * 모든 하위 카테고리 아이템을 flat 배열로 반환
 */
export function getAllCategoryItems(): CategoryItem[] {
  return CATEGORY_GROUPS.flatMap((group) => group.children);
}

/**
 * 모든 하위 카테고리 ID를 배열로 반환
 */
export function getAllCategoryIds(): string[] {
  return getAllCategoryItems().map((item) => item.id);
}

/**
 * 카테고리 ID로 아이템을 찾아서 반환
 */
export function getCategoryItem(
  categoryId: string
): CategoryItem | undefined {
  return getAllCategoryItems().find((item) => item.id === categoryId);
}

/**
 * 카테고리의 색상 클래스를 반환
 * 알 수 없는 카테고리는 기본 회색 반환
 */
export function getCategoryColor(categoryId: string): CategoryColor {
  const item = getCategoryItem(categoryId);
  if (item) {
    return item.color;
  }
  // 폴백 색상 (알 수 없는 카테고리)
  return {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    tabActive: 'text-gray-600',
  };
}

/**
 * 카테고리의 표시 레이블을 반환
 * 우선순위: CATEGORY_NAME_MAP → CategoryItem.label → categoryId
 */
export function getCategoryLabel(categoryId: string): string {
  // 1순위: 한글 매핑에서 찾기
  if (CATEGORY_NAME_MAP[categoryId]) {
    return CATEGORY_NAME_MAP[categoryId];
  }

  // 2순위: CategoryItem에서 찾기
  const item = getCategoryItem(categoryId);
  if (item?.label) {
    return item.label;
  }

  // 3순위: ID 그대로 반환
  return categoryId;
}

/**
 * 특정 그룹 ID로 그룹을 찾아서 반환
 */
export function getCategoryGroup(groupId: string): CategoryGroup | undefined {
  return CATEGORY_GROUPS.find((group) => group.id === groupId);
}

/**
 * 카테고리 ID로 해당 카테고리가 속한 그룹을 반환
 */
export function getGroupByCategoryId(
  categoryId: string
): CategoryGroup | undefined {
  return CATEGORY_GROUPS.find((group) =>
    group.children.some((item) => item.id === categoryId)
  );
}
