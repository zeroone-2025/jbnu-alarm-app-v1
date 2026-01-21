/**
 * 게시판 코드와 UI 메타데이터 매핑
 *
 * BOARDS_GUIDE.md 표준 정의를 따릅니다.
 * Active 게시판만 표시하며, Pending 게시판은 크롤러 구현 후 추가됩니다.
 */

export type BoardCategory = '전북대' | '단과대' | '학과' | '사업단';

/**
 * LocalStorage 저장 키 (Guest 사용자용)
 */
export const GUEST_FILTER_KEY = 'JB_ALARM_GUEST_FILTER';

export interface BoardMeta {
  name: string; // 전체 이름 (예: 컴퓨터인공지능학부)
  label: string; // 배지용 짧은 이름 (예: 컴인지)
  color: string; // 배지 색상 (로직용, Tailwind class와 매핑)
  category: BoardCategory; // 카테고리 분류
}

/**
 * ✅ Active 게시판 (크롤러 구현 완료)
 */
export const BOARD_MAP: Record<string, BoardMeta> = {
  home_campus: { name: "교내공지", label: "본부", color: "blue", category: "전북대" },
  agency_sw: { name: "SW중심대학사업단", label: "SW사업단", color: "green", category: "사업단" },
  college_eng: { name: "공과대학", label: "공대", color: "gray", category: "단과대" },
  dept_csai: { name: "컴퓨터인공지능학부", label: "컴인지", color: "indigo", category: "학과" },
};

/**
 * 🚧 Pending 게시판 (크롤러 구현 대기 중)
 * 백엔드 크롤러 구현 후 BOARD_MAP에 추가하세요.
 */
// export const PENDING_BOARDS: Record<string, BoardMeta> = {
//   home_student: { name: "학생공지", label: "학생", color: "blue", category: "전북대" },
//   home_recruitment: { name: "교내채용", label: "채용", color: "blue", category: "전북대" },
//   home_special: { name: "특강/세미나", label: "특강", color: "blue", category: "전북대" },
//   dept_elet: { name: "전자공학부", label: "전자", color: "indigo", category: "학과" },
//   dept_chmi: { name: "화학공학부", label: "화공", color: "indigo", category: "학과" },
//   dept_civl: { name: "토목공학부", label: "토목", color: "indigo", category: "학과" },
// };

/**
 * 게시판 코드로 전체 이름 조회
 */
export const getBoardName = (code: string): string => {
  return BOARD_MAP[code]?.name || code;
};

/**
 * 게시판 코드로 짧은 라벨 조회 (배지용)
 */
export const getBoardLabel = (code: string): string => {
  return BOARD_MAP[code]?.label || "공지";
};

/**
 * 게시판 코드로 색상 조회
 */
export const getBoardColor = (code: string): string => {
  return BOARD_MAP[code]?.color || "gray";
};

/**
 * 색상 이름을 Tailwind CSS 클래스로 변환
 */
export const getColorClasses = (color: string) => {
  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-100", text: "text-blue-700" },
    green: { bg: "bg-green-100", text: "text-green-700" },
    gray: { bg: "bg-gray-100", text: "text-gray-700" },
    indigo: { bg: "bg-indigo-100", text: "text-indigo-700" },
    sky: { bg: "bg-sky-100", text: "text-sky-700" },
  };

  return colorMap[color] || colorMap.gray;
};

/**
 * 전체 게시판 목록 (카테고리 포함)
 */
export const BOARD_LIST = Object.entries(BOARD_MAP).map(([id, meta]) => ({
  id,
  name: meta.name,
  category: meta.category,
}));

/**
 * 카테고리 표시 순서
 */
export const CATEGORY_ORDER: BoardCategory[] = ['전북대', '단과대', '학과', '사업단'];
