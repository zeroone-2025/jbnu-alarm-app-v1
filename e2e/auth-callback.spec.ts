import { test, expect } from './fixtures/auth.fixture';
import { mockAuthenticatedAPIs } from './fixtures/api-mocks';

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
    await expect(page).toHaveURL(/^\/$|\/\?login=success/, { timeout: 10_000 });
  });

  test('신규 유저 토큰 수신 시 온보딩으로 이동한다', async ({ page }) => {
    await mockAuthenticatedAPIs(page, { isNewUser: true });
    await page.goto('/auth/callback?access_token=test-token');
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10_000 });
  });
});
