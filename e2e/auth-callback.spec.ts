import { mockAuthenticatedAPIs } from './fixtures/api-mocks';
import { test, expect } from './fixtures/auth.fixture';
import { MOCK_USER } from './fixtures/test-data';

test.describe('Auth Callback 페이지', () => {
  test('로딩 스피너가 표시된다', async ({ asGuest }) => {
    await asGuest.goto('/auth/callback');
    await expect(asGuest.locator('.animate-spin')).toBeVisible();
  });

  test('로딩 문구가 표시된다', async ({ asGuest }) => {
    await asGuest.goto('/auth/callback');
    await expect(asGuest.getByText('로그인 중입니다')).toBeVisible();
  });

  test('access_token이 없으면 홈으로 리다이렉트된다', async ({ asGuest }) => {
    await asGuest.goto('/auth/callback');
    // 토큰 없으면 홈으로 이동
    await expect(asGuest).toHaveURL('/', { timeout: 10_000 });
  });

  test('error=access_denied이면 홈으로 리다이렉트된다', async ({ asGuest }) => {
    await asGuest.goto('/auth/callback?error=access_denied');
    await expect(asGuest).toHaveURL('/', { timeout: 10_000 });
  });

  test('기존 유저 토큰 수신 시 홈으로 이동한다', async ({ page }) => {
    await mockAuthenticatedAPIs(page);
    await page.goto('/auth/callback?access_token=test-token');
    // 홈으로 이동 (login=success 쿼리 파라미터는 Next.js router에 의해 제거될 수 있음)
    await expect(page).toHaveURL(/\/(\?login=success)?$/, { timeout: 10_000 });
  });

  test('신규 유저 토큰 수신 시 온보딩으로 이동한다', async ({ page }) => {
    await mockAuthenticatedAPIs(page, { isNewUser: true });
    await page.goto('/auth/callback?access_token=test-token');
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10_000 });
  });

  test('온보딩 완료 플래그가 true면 dept_code가 없어도 홈으로 이동한다', async ({ page }) => {
    await mockAuthenticatedAPIs(page, {
      user: {
        ...MOCK_USER,
        dept_code: null,
        onboarding_completed: true,
      },
    });
    await page.goto('/auth/callback?access_token=test-token');
    await expect(page).toHaveURL(/\/(\?login=success)?$/, { timeout: 10_000 });
  });

  test('온보딩 완료 플래그가 false여도 dept_code가 있으면 홈으로 이동한다', async ({ page }) => {
    await mockAuthenticatedAPIs(page, {
      user: {
        ...MOCK_USER,
        dept_code: 'dept_csai',
        onboarding_completed: false,
      },
    });
    await page.goto('/auth/callback?access_token=test-token');
    await expect(page).toHaveURL(/\/(\?login=success)?$/, { timeout: 10_000 });
  });

  test('safe redirect_to가 있으면 해당 경로로 이동한다', async ({ page }) => {
    await mockAuthenticatedAPIs(page);
    await page.goto('/auth/callback?access_token=test-token&redirect_to=%2Ffilter');
    await expect(page).toHaveURL(/\/filter\/?$/, { timeout: 10_000 });
  });
});
