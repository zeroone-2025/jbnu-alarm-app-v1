/**
 * localStorage 설정 헬퍼
 * page.addInitScript()로 페이지 로드 전에 localStorage를 설정
 */

import { Page } from '@playwright/test';

/**
 * 페이지 로드 전 localStorage에 값을 설정
 */
export async function setLocalStorage(page: Page, items: Record<string, string>) {
  await page.addInitScript((storageItems) => {
    for (const [key, value] of Object.entries(storageItems)) {
      localStorage.setItem(key, value);
    }
  }, items);
}

/**
 * 게스트용 기본 게시판 구독 설정
 * boards.ts의 GUEST_DEFAULT_BOARDS와 동일
 */
export async function setupGuestBoards(page: Page) {
  await setLocalStorage(page, {
    JB_ALARM_GUEST_FILTER: JSON.stringify({
      version: 2,
      boards: [
        'home_campus', 'home_student', 'home_lecture',
        'home_news', 'home_contest', 'home_parttime', 'agency_sw',
      ],
    }),
  });
}

/**
 * 로그인 사용자용 구독 게시판 설정
 */
export async function setupAuthBoards(page: Page) {
  await setLocalStorage(page, {
    my_subscribed_categories: JSON.stringify([
      'home_campus', 'home_student', 'dept_csai', 'agency_sw',
    ]),
  });
}
