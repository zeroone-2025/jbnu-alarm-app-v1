/**
 * Playwright test 확장: 인증 상태별 픽스처
 *
 * 사용법:
 *   import { test, expect } from '../fixtures/auth.fixture';
 *
 *   test('게스트 테스트', async ({ asGuest }) => {
 *     const page = asGuest;
 *     await page.goto('/');
 *   });
 *
 *   test('로그인 테스트', async ({ asLoggedInUser }) => {
 *     const page = asLoggedInUser;
 *     await page.goto('/');
 *   });
 */

import { test as base, expect, Page } from '@playwright/test';
import { mockGuestAPIs, mockAuthenticatedAPIs } from './api-mocks';
import { setupGuestBoards } from './storage';

export { expect };

type AuthFixtures = {
  asGuest: Page;
  asLoggedInUser: Page;
};

export const test = base.extend<AuthFixtures>({
  asGuest: async ({ page }, use) => {
    await mockGuestAPIs(page);
    await setupGuestBoards(page);
    await use(page);
  },

  asLoggedInUser: async ({ page }, use) => {
    await mockAuthenticatedAPIs(page);
    await use(page);
  },
});
