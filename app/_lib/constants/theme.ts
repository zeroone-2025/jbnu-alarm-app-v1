/**
 * 애플리케이션 전역 테마 상수
 * 하드코딩 방지 및 일관된 디자인 시스템 유지
 */

export const THEME = {
  // 읽음/안읽음 상태 스타일링
  readState: {
    // 읽은 공지사항 스타일
    read: {
      opacity: 0.6, // 투명도
      textColor: "text-gray-500", // Tailwind 회색 텍스트
      titleColor: "text-gray-600",
    },
    // 안 읽은 공지사항 스타일
    unread: {
      opacity: 1.0, // 선명하게
      textColor: "text-gray-900", // 기본 텍스트 색상
      titleColor: "text-gray-900",
    },
  },

  // 카테고리 뱃지 색상은 기존 categories.ts에서 관리
  // 추후 확장: 다크모드 색상, 폰트 크기 등 추가 가능
} as const;
