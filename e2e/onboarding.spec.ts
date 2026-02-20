import { mockAuthenticatedAPIs } from './fixtures/api-mocks';
import { test, expect } from './fixtures/auth.fixture';
import { MOCK_USER } from './fixtures/test-data';

test.describe('온보딩 페이지 - 게스트', () => {
  test('온보딩 모달이 렌더링된다', async ({ asGuest }) => {
    await asGuest.goto('/onboarding');
    // OnboardingModal이 열림 - 학생/멘토 선택 UI가 보이거나 스피너가 사라진 후 모달이 보여야 함
    await expect(asGuest.locator('.animate-spin')).toHaveCount(0, { timeout: 10_000 });
  });
});

test.describe('온보딩 페이지 - 로그인 사용자', () => {
  test('이미 온보딩 완료한 유저는 홈으로 리다이렉트', async ({ asLoggedInUser }) => {
    // MOCK_USER는 dept_code가 있으므로 홈으로 이동
    await asLoggedInUser.goto('/onboarding');
    await expect(asLoggedInUser).toHaveURL('/', { timeout: 10_000 });
  });

  test('온보딩 완료 플래그가 true면 dept_code가 없어도 홈으로 리다이렉트', async ({ page }) => {
    await mockAuthenticatedAPIs(page, {
      user: {
        ...MOCK_USER,
        dept_code: null,
        onboarding_completed: true,
      },
    });
    await page.goto('/onboarding');
    await expect(page).toHaveURL('/', { timeout: 10_000 });
  });

  test('온보딩 완료 플래그가 false여도 dept_code가 있으면 홈으로 리다이렉트', async ({ page }) => {
    await mockAuthenticatedAPIs(page, {
      user: {
        ...MOCK_USER,
        dept_code: 'dept_csai',
        onboarding_completed: false,
      },
    });
    await page.goto('/onboarding');
    await expect(page).toHaveURL('/', { timeout: 10_000 });
  });

  test('신규 유저는 온보딩 폼이 표시된다', async ({ page }) => {
    await mockAuthenticatedAPIs(page, { isNewUser: true });
    await page.goto('/onboarding');
    await expect(page.locator('.animate-spin')).toHaveCount(0, { timeout: 10_000 });
    // OnboardingModal이 열려야 함
  });
});
