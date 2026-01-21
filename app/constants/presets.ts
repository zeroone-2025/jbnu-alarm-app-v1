/**
 * 학과별 맞춤 구독 프리셋 설정
 *
 * 새로운 학과를 추가하려면:
 * 1. MajorPreset 인터페이스에 맞춰 새로운 객체를 추가
 * 2. categories 배열에 해당 학과의 필수 구독 카테고리 ID를 나열
 * 3. MAJOR_PRESETS 배열에 추가
 *
 * 카테고리 ID 규칙:
 * - academic_*: 학사 알림 (본부 공지 등)
 * - college_*: 단과대 공지
 * - dept_*: 학과 공지
 * - agency_*: 사업단 공지
 */

export interface MajorPreset {
  id: string;          // 고유 식별자 (예: 'cse', 'software')
  label: string;       // 화면 표시 이름 (예: '컴퓨터인공지능학부')
  categories: string[]; // 구독할 카테고리 코드 목록
}

/**
 * 학과별 구독 프리셋 목록
 *
 * 현재 지원: 공과대학 일부 학과
 * TODO: 여기에 다른 학과를 형식에 맞춰 추가하세요
 */
export const MAJOR_PRESETS: MajorPreset[] = [
  {
    id: 'cse',
    label: '컴퓨터인공지능학부',
    categories: [
      'home_campus',      // 본부 공지 (교내공지)
      'dept_csai',        // 학과 공지
      'college_eng',      // 공과대학
      'agency_sw',        // SW중심대학사업단
    ],
  },
  {
    id: 'software',
    label: '소프트웨어학과',
    categories: [
      'home_campus',      // 본부 공지 (교내공지)
      'college_eng',      // 공과대학
      'agency_sw',        // SW중심대학사업단
      // 'dept_software' - 아직 크롤러 미구현
    ],
  },
  // TODO: 다른 공과대학 학과 추가
  // {
  //   id: 'ee',
  //   label: '전자공학과',
  //   categories: ['dept_ee', 'college_eng', 'academic_main'],
  // },
  // {
  //   id: 'me',
  //   label: '기계공학과',
  //   categories: ['dept_me', 'college_eng', 'academic_main'],
  // },

  // TODO: 다른 단과대 학과 추가
  // {
  //   id: 'business',
  //   label: '경영학과',
  //   categories: ['dept_business', 'college_biz', 'academic_main'],
  // },

  // 기타/선택안함 (본부 공지만 구독)
  {
    id: 'common',
    label: '기타 (본부 공지만 구독)',
    categories: ['home_campus'],
  },
];

/**
 * 학과 ID로 프리셋 찾기
 */
export function getMajorPreset(majorId: string): MajorPreset | undefined {
  return MAJOR_PRESETS.find((preset) => preset.id === majorId);
}

/**
 * 학과 라벨로 프리셋 찾기
 */
export function getMajorPresetByLabel(label: string): MajorPreset | undefined {
  return MAJOR_PRESETS.find((preset) => preset.label === label);
}
