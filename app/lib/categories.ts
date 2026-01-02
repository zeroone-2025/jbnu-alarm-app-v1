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

// 계층적 카테고리 그룹 설정
export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'academic',
    label: '학사 알림',
    order: 1,
    children: [
      {
        id: 'homepage',
        label: '학교 공지',
        color: COLOR_PALETTE[0], // indigo
        available: true,
      },
    ],
  },
  {
    id: 'college',
    label: '단과대',
    order: 2,
    children: [], // 준비 중
  },
  {
    id: 'department',
    label: '학과',
    order: 3,
    children: [
      {
        id: 'csai',
        label: '컴퓨터인공지능학부',
        color: COLOR_PALETTE[1], // emerald
        available: true,
      },
    ],
  },
  {
    id: 'business',
    label: '사업단',
    order: 4,
    children: [], // 준비 중
  },
];

// 헬퍼 함수들

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
 * 알 수 없는 카테고리는 ID를 그대로 반환
 */
export function getCategoryLabel(categoryId: string): string {
  const item = getCategoryItem(categoryId);
  return item?.label || categoryId;
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
