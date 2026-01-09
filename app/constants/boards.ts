/**
 * 게시판 코드와 UI 메타데이터 매핑
 *
 * DB 테이블 없이 프론트엔드에서 게시판 정보를 관리합니다.
 */

export interface BoardMeta {
  name: string; // 전체 이름 (예: 컴퓨터인공지능학부)
  label: string; // 배지용 짧은 이름 (예: 컴인지)
  color: string; // 배지 색상 (로직용, Tailwind class와 매핑)
}

export const BOARD_MAP: Record<string, BoardMeta> = {
  home_campus: { name: "교내공지", label: "본부", color: "blue" },
  home_student: { name: "학생공지", label: "학생", color: "blue" },
  home_recruitment: { name: "교내채용", label: "채용", color: "blue" },
  home_special: { name: "특강/세미나", label: "특강", color: "blue" },
  agency_sw: { name: "SW중심대학사업단", label: "SW사업단", color: "green" },
  college_eng: { name: "공과대학", label: "공대", color: "gray" },
  dept_csai: { name: "컴퓨터인공지능학부", label: "컴인지", color: "indigo" },
  dept_elet: { name: "전자공학부", label: "전자", color: "indigo" },
  dept_chmi: { name: "화학공학부", label: "화공", color: "indigo" },
  dept_civl: { name: "토목공학부", label: "토목", color: "indigo" },
};

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
  };

  return colorMap[color] || colorMap.gray;
};
