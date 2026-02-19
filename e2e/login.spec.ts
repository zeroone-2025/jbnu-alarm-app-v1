import { test, expect } from './fixtures/auth.fixture';

test.describe('로그인 페이지 - 게스트', () => {
  test('로그인 페이지가 렌더링된다', async ({ asGuest }) => {
    await asGuest.goto('/login');
    await expect(asGuest.getByRole('heading', { name: '로그인' })).toBeVisible({ timeout: 10_000 });
  });

  test('소셜 로그인 안내 텍스트가 표시된다', async ({ asGuest }) => {
    await asGuest.goto('/login');
    await expect(asGuest.getByText('소셜 계정으로 간편하게 시작하세요')).toBeVisible({ timeout: 10_000 });
  });

  test('둘러보기 버튼이 존재한다', async ({ asGuest }) => {
    await asGuest.goto('/login');
    await expect(asGuest.getByText('로그인 없이 둘러보기')).toBeVisible({ timeout: 10_000 });
  });

  test('둘러보기 클릭 시 홈으로 이동한다', async ({ asGuest }) => {
    await asGuest.goto('/login');
    await asGuest.getByText('로그인 없이 둘러보기').click();
    await expect(asGuest).toHaveURL('/', { timeout: 10_000 });
  });

  test('최근 로그인 제공자 툴팁이 표시된다', async ({ page }) => {
    // localStorage에 최근 제공자 설정 후 테스트
    const { mockGuestAPIs } = await import('./fixtures/api-mocks');
    await mockGuestAPIs(page);
    await page.addInitScript(() => {
      localStorage.setItem('last_login_provider', 'google');
    });
    await page.goto('/login');
    await expect(page.getByText('최근에 Google 로그인을 사용했어요')).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('로그인 페이지 - 로그인 사용자', () => {
  test('로그인된 유저는 홈으로 리다이렉트된다', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/login');
    await expect(asLoggedInUser).toHaveURL('/', { timeout: 10_000 });
  });
});
