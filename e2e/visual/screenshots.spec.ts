import { test, expect } from '../fixtures/auth.fixture';

/**
 * 비주얼 리그레션 테스트
 *
 * 모든 페이지를 guest/auth 상태로 스크린샷 캡처 후 비교.
 * 기준 이미지 갱신: npx playwright test e2e/visual/ --update-snapshots
 */

const SCREENSHOT_OPTIONS = {
  maxDiffPixelRatio: 0.01,
  animations: 'disabled' as const,
};

test.describe('비주얼 리그레션 - 게스트', () => {
  test('홈 페이지', async ({ asGuest }) => {
    await asGuest.goto('/');
    await expect(asGuest.locator('.animate-spin')).toHaveCount(0, { timeout: 10_000 });
    await expect(asGuest).toHaveScreenshot('home-guest.png', SCREENSHOT_OPTIONS);
  });

  test('로그인 페이지', async ({ asGuest }) => {
    await asGuest.goto('/login');
    await expect(asGuest.getByRole('heading', { name: '로그인' })).toBeVisible({ timeout: 10_000 });
    await expect(asGuest).toHaveScreenshot('login-guest.png', SCREENSHOT_OPTIONS);
  });

  test('필터 페이지', async ({ asGuest }) => {
    await asGuest.goto('/filter');
    await expect(asGuest.getByText('관심 게시판 설정')).toBeVisible({ timeout: 10_000 });
    await expect(asGuest).toHaveScreenshot('filter-guest.png', SCREENSHOT_OPTIONS);
  });

  test('알림 페이지', async ({ asGuest }) => {
    await asGuest.goto('/notifications');
    await expect(asGuest.getByText('로그인하면 알림을 받을 수 있어요')).toBeVisible({ timeout: 10_000 });
    await expect(asGuest).toHaveScreenshot('notifications-guest.png', SCREENSHOT_OPTIONS);
  });

  test('친바 페이지', async ({ asGuest }) => {
    await asGuest.goto('/chinba');
    await expect(asGuest.locator('.animate-spin')).toHaveCount(0, { timeout: 10_000 });
    await expect(asGuest).toHaveScreenshot('chinba-guest.png', SCREENSHOT_OPTIONS);
  });

  test('친바 생성 페이지', async ({ asGuest }) => {
    await asGuest.goto('/chinba/create');
    await expect(asGuest.getByText('새 일정 만들기')).toBeVisible({ timeout: 10_000 });
    await expect(asGuest).toHaveScreenshot('chinba-create-guest.png', SCREENSHOT_OPTIONS);
  });
});

test.describe('비주얼 리그레션 - 로그인 사용자', () => {
  test('홈 페이지', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/');
    await expect(asLoggedInUser.locator('.animate-spin')).toHaveCount(0, { timeout: 10_000 });
    await expect(asLoggedInUser).toHaveScreenshot('home-auth.png', SCREENSHOT_OPTIONS);
  });

  test('필터 페이지', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/filter');
    await expect(asLoggedInUser.getByText('관심 게시판 설정')).toBeVisible({ timeout: 10_000 });
    await expect(asLoggedInUser).toHaveScreenshot('filter-auth.png', SCREENSHOT_OPTIONS);
  });

  test('키워드 페이지', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/keywords');
    await expect(asLoggedInUser.getByText('키워드 알림')).toBeVisible({ timeout: 10_000 });
    await expect(asLoggedInUser).toHaveScreenshot('keywords-auth.png', SCREENSHOT_OPTIONS);
  });

  test('알림 페이지', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/notifications');
    await expect(asLoggedInUser.locator('.animate-spin')).toHaveCount(0, { timeout: 10_000 });
    await expect(asLoggedInUser).toHaveScreenshot('notifications-auth.png', SCREENSHOT_OPTIONS);
  });

  test('프로필 페이지', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/profile');
    await expect(asLoggedInUser.locator('.animate-spin')).toHaveCount(0, { timeout: 10_000 });
    await expect(asLoggedInUser).toHaveScreenshot('profile-auth.png', SCREENSHOT_OPTIONS);
  });

  test('친바 페이지', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/chinba');
    await expect(asLoggedInUser.locator('.animate-spin')).toHaveCount(0, { timeout: 10_000 });
    await expect(asLoggedInUser).toHaveScreenshot('chinba-auth.png', SCREENSHOT_OPTIONS);
  });

  test('친바 생성 페이지', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/chinba/create');
    await expect(asLoggedInUser.getByText('새 일정 만들기')).toBeVisible({ timeout: 10_000 });
    await expect(asLoggedInUser).toHaveScreenshot('chinba-create-auth.png', SCREENSHOT_OPTIONS);
  });

  test('친바 이벤트 상세 페이지', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/chinba/event?id=evt-001');
    await expect(asLoggedInUser.getByRole('heading', { name: '조별과제 회의' }).first()).toBeVisible({ timeout: 10_000 });
    await expect(asLoggedInUser).toHaveScreenshot('chinba-event-auth.png', SCREENSHOT_OPTIONS);
  });
});
