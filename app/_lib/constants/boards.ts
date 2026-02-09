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
  color: string; // 배지 색상 (로직용, Tailwind class와 매핑)
  category: BoardCategory; // 카테고리 분류
}

/**
 * ✅ Active 게시판 (크롤러 구현 완료)
 */
export const BOARD_MAP: Record<string, BoardMeta> = {
  // 전북대 본부 공지
  home_campus: { name: "교내공지", color: "blue", category: "전북대" },
  home_student: { name: "학생공지", color: "blue", category: "전북대" },
  home_lecture: { name: "특강&세미나", color: "sky", category: "전북대" },
  home_news: { name: "JBNU News", color: "sky", category: "전북대" },
  home_newsplus: { name: "JBNU Newsplus", color: "blue", category: "전북대" },
  home_policy: { name: "교육정책/주요대학소식", color: "blue", category: "전북대" },
  home_contest: { name: "공모/스터디", color: "teal", category: "전북대" },
  home_parttime: { name: "아르바이트", color: "teal", category: "전북대" },
  home_housing: { name: "자취/하숙", color: "blue", category: "전북대" },
  home_lostandfound: { name: "분실/습득", color: "blue", category: "전북대" },
  home_poster: { name: "전자대자보", color: "blue", category: "전북대" },

  // 단과대
  college_nursing: { name: "간호대학", color: "gray", category: "단과대" },
  college_cbe: { name: "경상대학", color: "gray", category: "단과대" },
  college_eng: { name: "공과대학", color: "gray", category: "단과대" },
  college_sies: { name: "국제이공학부", color: "gray", category: "단과대" },
  college_agri: { name: "농업생명과학대학", color: "gray", category: "단과대" },
  college_coe: { name: "사범대학", color: "gray", category: "단과대" },
  college_social: { name: "사회과학대학", color: "gray", category: "단과대" },
  college_he: { name: "생활과학대학", color: "gray", category: "단과대" },
  college_vetmed: { name: "수의과대학", color: "gray", category: "단과대" },
  college_pharm: { name: "약학대학", color: "gray", category: "단과대" },
  college_arts: { name: "예술대학", color: "gray", category: "단과대" },
  college_med: { name: "의과대학", color: "gray", category: "단과대" },
  college_human: { name: "인문대학", color: "gray", category: "단과대" },
  college_natural: { name: "자연과학대학", color: "gray", category: "단과대" },
  college_dent: { name: "치과대학", color: "gray", category: "단과대" },
  college_convergence: { name: "융합자율전공학부", color: "gray", category: "단과대" },
  dept_business: { name: "경영학과", color: "orange", category: "학과" },
  dept_economics: { name: "경제학부", color: "orange", category: "학과" },
  dept_mechanical: { name: "기계공학", color: "orange", category: "학과" },
  dept_mse: { name: "기계시스템공학부", color: "orange", category: "학과" },
  dept_animalsci: { name: "동물자원과학과", color: "orange", category: "학과" },
  dept_trade: { name: "무역학과", color: "orange", category: "학과" },
  dept_lis: { name: "문헌정보학과", color: "orange", category: "학과" },
  dept_physics: { name: "물리학과", color: "orange", category: "학과" },
  dept_semi: { name: "반도체과학기술학과", color: "orange", category: "학과" },
  dept_molbio: { name: "분자생물학과", color: "orange", category: "학과" },
  dept_history: { name: "사학과", color: "orange", category: "학과" },
  dept_welfare: { name: "사회복지학과", color: "orange", category: "학과" },
  dept_sociology: { name: "사회학과", color: "orange", category: "학과" },
  dept_biotech: { name: "생명공학부", color: "orange", category: "학과" },
  dept_bioedu: { name: "생물교육학과", color: "orange", category: "학과" },
  dept_bime: { name: "생물산업기계공학과", color: "orange", category: "학과" },
  dept_bioenv: { name: "생물환경화학과", color: "orange", category: "학과" },
  dept_foodtech: { name: "식품공학과", color: "orange", category: "학과" },
  dept_fshn: { name: "식품영양학과", color: "orange", category: "학과" },
  dept_child: { name: "아동학과", color: "orange", category: "학과" },
  dept_english: { name: "영어영문학과", color: "orange", category: "학과" },
  dept_ethedu: { name: "윤리교육학과", color: "orange", category: "학과" },
  dept_fashion: { name: "의류학과", color: "orange", category: "학과" },
  dept_crop: { name: "작물생명과학과", color: "orange", category: "학과" },
  dept_electronics: { name: "전자공학부", color: "orange", category: "학과" },
  dept_political: { name: "정치외교학과", color: "orange", category: "학과" },
  dept_housing: { name: "주거환경학과", color: "orange", category: "학과" },
  dept_chinese: { name: "중어중문학과", color: "orange", category: "학과" },
  dept_earthedu: { name: "지구과학교육학과", color: "orange", category: "학과" },
  dept_csai: { name: "컴퓨터인공지능학부", color: "orange", category: "학과" },
  dept_statistics: { name: "통계학과", color: "orange", category: "학과" },
  dept_french: { name: "프랑스아프리카학과", color: "orange", category: "학과" },
  dept_admin: { name: "행정학과", color: "orange", category: "학과" },
  dept_chemistry: { name: "화학과", color: "orange", category: "학과" },
  dept_chemical: { name: "화학공학부", color: "orange", category: "학과" },
  dept_chemedu: { name: "화학교육학과", color: "orange", category: "학과" },
  dept_accounting: { name: "회계학과", color: "orange", category: "학과" },
  dept_archi: { name: "건축공학과", color: "orange", category: "학과" },
  dept_polynano: { name: "고분자나노공학과", color: "orange", category: "학과" },
  dept_mdesign: { name: "기계설계공학부", color: "orange", category: "학과" },
  dept_urban: { name: "도시공학과", color: "orange", category: "학과" },
  dept_biomedical: { name: "바이오메디컬공학부", color: "orange", category: "학과" },
  dept_ise: { name: "산업정보시스템공학과", color: "orange", category: "학과" },
  dept_software: { name: "소프트웨어공학과", color: "orange", category: "학과" },
  dept_metal: { name: "금속시스템공학전공", color: "orange", category: "학과" },
  dept_materials: { name: "전자재료공학전공", color: "orange", category: "학과" },
  dept_itmat: { name: "정보소재공학전공", color: "orange", category: "학과" },
  dept_atom: { name: "양자시스템공학과", color: "orange", category: "학과" },
  dept_org: { name: "유기소재섬유공학과", color: "orange", category: "학과" },
  dept_cte: { name: "IT융합기전공학", color: "orange", category: "학과" },
  dept_itase: { name: "IT응용시스템공학과", color: "orange", category: "학과" },
  dept_ee: { name: "전기공학과", color: "orange", category: "학과" },
  dept_res: { name: "자원에너지공학과", color: "orange", category: "학과" },
  dept_civil: { name: "토목공학과", color: "orange", category: "학과" },
  dept_envi: { name: "환경공학과", color: "orange", category: "학과" },
  dept_aerospace: { name: "항공우주공학과", color: "orange", category: "학과" },
  dept_frme: { name: "농업경제학전공", color: "orange", category: "학과" },
  dept_agrifm: { name: "식품유통학전공", color: "orange", category: "학과" },
  dept_animalbio: { name: "동물생명공학과", color: "orange", category: "학과" },
  dept_wse: { name: "목재응용과학과", color: "orange", category: "학과" },
  dept_fore: { name: "산림환경과학과", color: "orange", category: "학과" },
  dept_barr: { name: "생명자원융합학과", color: "orange", category: "학과" },
  dept_jsf: { name: "스마트팜학과", color: "orange", category: "학과" },
  dept_plantmed: { name: "식물의학과", color: "orange", category: "학과" },
  dept_hort: { name: "원예학과", color: "orange", category: "학과" },
  dept_la: { name: "조경학과", color: "orange", category: "학과" },
  dept_agrieng: { name: "지역건설공학과", color: "orange", category: "학과" },
  dept_culture: { name: "고고문화인류학과", color: "orange", category: "학과" },
  dept_korean: { name: "국어국문학과", color: "orange", category: "학과" },
  dept_tsis: { name: "국제학부", color: "orange", category: "학과" },
  dept_deutsch: { name: "독일학과", color: "orange", category: "학과" },
  dept_spanish: { name: "스페인중남미학과", color: "orange", category: "학과" },
  dept_japan: { name: "일본학과", color: "orange", category: "학과" },
  dept_philos: { name: "철학과", color: "orange", category: "학과" },
  dept_ss: { name: "과학학과", color: "orange", category: "학과" },
  dept_bio: { name: "생명과학과", color: "orange", category: "학과" },
  dept_math: { name: "수학과", color: "orange", category: "학과" },
  dept_sportscience: { name: "스포츠과학과", color: "orange", category: "학과" },
  dept_ees: { name: "지구환경과학과", color: "orange", category: "학과" },
  dept_koredu: { name: "국어교육과", color: "orange", category: "학과" },
  dept_germanedu: { name: "독어교육과", color: "orange", category: "학과" },
  dept_mathedu: { name: "수학교육과", color: "orange", category: "학과" },
  dept_englishedu: { name: "영어교육과", color: "orange", category: "학과" },
  dept_historyedu: { name: "역사교육전공", color: "orange", category: "학과" },
  dept_socialedu: { name: "일반사회교육전공", color: "orange", category: "학과" },
  dept_geoedu: { name: "지리교육전공", color: "orange", category: "학과" },
  dept_media: { name: "미디어커뮤니케이션학과", color: "orange", category: "학과" },
  dept_psy: { name: "심리학과", color: "orange", category: "학과" },
  dept_hanyak: { name: "한약자원학과", color: "orange", category: "학과" },
  dept_defense: { name: "첨단방위산업학과", color: "orange", category: "학과" },
  agency_sw: { name: "SW중심대학사업단", color: "green", category: "사업단" },
  agency_likehome: { name: "생활관", color: "green", category: "사업단" },
  agency_library: { name: "도서관", color: "green", category: "사업단" },
  agency_juice_semi: { name: "반도체특성화대학사업단", color: "green", category: "사업단" },
};

/**
 * 게시판 코드로 전체 이름 조회
 */
export const getBoardName = (code: string): string => {
  return BOARD_MAP[code]?.name || code;
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
    orange: { bg: "bg-orange-100", text: "text-orange-700" },
    sky: { bg: "bg-sky-100", text: "text-sky-700" },
    teal: { bg: "bg-teal-100", text: "text-teal-700" },
  };

  return colorMap[color] || colorMap.gray;
};


/**
 * 게스트 필터 버전 (기본값 변경 시 증가)
 * 버전이 다르면 localStorage를 새 기본값으로 덮어씁니다.
 */
export const GUEST_FILTER_VERSION = 2;

/**
 * 게스트 기본 필터 게시판 목록
 */
export const GUEST_DEFAULT_BOARDS = [
  'home_campus', 'home_student', 'home_lecture',
  'home_news', 'home_contest', 'home_parttime', 'agency_sw',
];


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
