import { test, expect } from './fixtures/auth.fixture';

test.describe('키워드 페이지 - 게스트', () => {
  test('비로그인 시 홈으로 리다이렉트된다', async ({ asGuest }) => {
    await asGuest.goto('/keywords');
    await expect(asGuest).toHaveURL('/', { timeout: 10_000 });
  });
});

test.describe('키워드 페이지 - 로그인 사용자', () => {
  test('FullPageModal이 렌더링된다', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/keywords');
    await expect(asLoggedInUser.getByText('키워드 알림')).toBeVisible({ timeout: 10_000 });
  });

  test('뒤로가기 버튼이 있다', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/keywords');
    await expect(asLoggedInUser.getByRole('button', { name: '뒤로가기' })).toBeVisible({ timeout: 10_000 });
  });

  test('키워드 목록이 표시된다', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/keywords');
    await expect(asLoggedInUser.getByText('키워드 알림')).toBeVisible({ timeout: 10_000 });
    // 목 데이터의 키워드 확인
    await expect(asLoggedInUser.getByText('장학금')).toBeVisible({ timeout: 10_000 });
    await expect(asLoggedInUser.getByText('수강신청')).toBeVisible({ timeout: 10_000 });
  });

  test('키워드 추가 후 목록에 표시된다', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/keywords');
    await expect(asLoggedInUser.getByText('키워드 알림')).toBeVisible({ timeout: 10_000 });

    await asLoggedInUser.fill('input[placeholder*="키워드 입력"]', '장학금');
    await asLoggedInUser.getByRole('button', { name: '추가' }).click();
    await expect(asLoggedInUser.getByText('장학금')).toBeVisible({ timeout: 10_000 });
  });

  test('키워드 삭제 후 목록에서 제거된다', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/keywords');
    await expect(asLoggedInUser.getByText('장학금')).toBeVisible({ timeout: 10_000 });

    await asLoggedInUser.getByRole('button', { name: '장학금 삭제' }).click();
    await expect(asLoggedInUser.getByText('장학금')).not.toBeVisible({ timeout: 10_000 });
  });

  test('1글자 키워드 입력 시 안내 메시지 표시', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/keywords');
    await expect(asLoggedInUser.getByText('키워드 알림')).toBeVisible({ timeout: 10_000 });

    await asLoggedInUser.fill('input[placeholder*="키워드 입력"]', '전');
    await asLoggedInUser.getByRole('button', { name: '추가' }).click();
    await expect(asLoggedInUser.getByText('키워드는 2글자 이상 입력해 주세요.')).toBeVisible({ timeout: 10_000 });
  });
});
