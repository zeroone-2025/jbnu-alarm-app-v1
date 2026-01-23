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
  college_nursing: { name: "간호대학", label: "간호대", color: "gray", category: "단과대" },
  college_cbe: { name: "경상대학", label: "경상대", color: "gray", category: "단과대" },
  college_eng: { name: "공과대학", label: "공대", color: "gray", category: "단과대" },
  college_agri: { name: "농업생명과학대학", label: "농생대", color: "gray", category: "단과대" },
  college_coe: { name: "사범대학", label: "사범대", color: "gray", category: "단과대" },
  college_social: { name: "사회과학대학", label: "사회대", color: "gray", category: "단과대" },
  college_he: { name: "생활과학대학", label: "생과대", color: "gray", category: "단과대" },
  college_vetmed: { name: "수의과대학", label: "수의대", color: "gray", category: "단과대" },
  college_arts: { name: "예술대학", label: "예술대", color: "gray", category: "단과대" },
  college_pharm: { name: "약학대학", label: "약대", color: "gray", category: "단과대" },
  college_med: { name: "의과대학", label: "의대", color: "gray", category: "단과대" },
  college_human: { name: "인문대학", label: "인문대", color: "gray", category: "단과대" },
  college_natural: { name: "자연과학대학", label: "자연대", color: "gray", category: "단과대" },
  college_dent: { name: "치과대학", label: "치대", color: "gray", category: "단과대" },
  college_convergence: { name: "융합자율전공학부", label: "융합학부", color: "gray", category: "단과대" },
  college_sies: { name: "국제이공학부", label: "국제이공", color: "gray", category: "단과대" },
  dept_csai: { name: "컴퓨터인공지능학부", label: "컴인지", color: "indigo", category: "학과" },
  dept_business: { name: "경영학과", label: "경영", color: "indigo", category: "학과" },
  dept_trade: { name: "무역학과", label: "무역", color: "indigo", category: "학과" },
  dept_economics: { name: "경제학부", label: "경제", color: "indigo", category: "학과" },
  dept_accounting: { name: "회계학과", label: "회계", color: "indigo", category: "학과" },
  dept_english: { name: "영어영문학과", label: "영문", color: "indigo", category: "학과" },
  dept_history: { name: "사학과", label: "사학", color: "indigo", category: "학과" },
  dept_chinese: { name: "중어중문학과", label: "중문", color: "indigo", category: "학과" },
  dept_french: { name: "프랑스아프리카학과", label: "불문", color: "indigo", category: "학과" },
  dept_lis: { name: "문헌정보학과", label: "문헌정보", color: "indigo", category: "학과" },
  dept_electronics: { name: "전자공학부", label: "전자", color: "indigo", category: "학과" },
  dept_chemical: { name: "화학공학부", label: "화공", color: "indigo", category: "학과" },
  dept_mechanical: { name: "기계공학", label: "기계", color: "indigo", category: "학과" },
  dept_mse: { name: "기계시스템공학부", label: "기계시스템", color: "indigo", category: "학과" },
  dept_foodtech: { name: "식품공학과", label: "식품공학", color: "indigo", category: "학과" },
  dept_animalsci: { name: "동물자원과학과", label: "동물자원", color: "indigo", category: "학과" },
  dept_bioenv: { name: "생물환경화학과", label: "생물환경", color: "indigo", category: "학과" },
  dept_bime: { name: "생물산업기계공학과", label: "생물산업", color: "indigo", category: "학과" },
  dept_crop: { name: "작물생명과학과", label: "작물생명", color: "indigo", category: "학과" },
  dept_bioedu: { name: "생물교육전공", label: "생물교육", color: "indigo", category: "학과" },
  dept_earthedu: { name: "지구과학교육전공", label: "지구교육", color: "indigo", category: "학과" },
  dept_chemedu: { name: "화학교육전공", label: "화학교육", color: "indigo", category: "학과" },
  dept_ethedu: { name: "윤리교육전공", label: "윤리교육", color: "indigo", category: "학과" },
  dept_political: { name: "정치외교학과", label: "정외", color: "indigo", category: "학과" },
  dept_admin: { name: "행정학과", label: "행정", color: "indigo", category: "학과" },
  dept_sociology: { name: "사회학과", label: "사회", color: "indigo", category: "학과" },
  dept_welfare: { name: "사회복지학과", label: "사복", color: "indigo", category: "학과" },
  dept_fshn: { name: "식품영양학과", label: "식품영양", color: "indigo", category: "학과" },
  dept_housing: { name: "주거환경학과", label: "주거환경", color: "indigo", category: "학과" },
  dept_fashion: { name: "의류학과", label: "의류", color: "indigo", category: "학과" },
  dept_child: { name: "아동학과", label: "아동", color: "indigo", category: "학과" },
  dept_biotech: { name: "생명공학부", label: "생명공학", color: "indigo", category: "학과" },
  dept_semi: { name: "반도체과학기술학과", label: "반도체", color: "indigo", category: "학과" },
  dept_chemistry: { name: "화학과", label: "화학", color: "indigo", category: "학과" },
  dept_statistics: { name: "통계학과", label: "통계", color: "indigo", category: "학과" },
  dept_physics: { name: "물리학과", label: "물리", color: "indigo", category: "학과" },
  dept_molbio: { name: "분자생물학과", label: "분자생물", color: "indigo", category: "학과" },
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
