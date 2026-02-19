import { test, expect } from './fixtures/auth.fixture';

test.describe('알림 페이지 - 게스트', () => {
  test('FullPageModal이 렌더링된다', async ({ asGuest }) => {
    await asGuest.goto('/notifications');
    await expect(asGuest.getByText('알림').first()).toBeVisible({ timeout: 10_000 });
  });

  test('비로그인 시 로그인 안내 UI가 표시된다', async ({ asGuest }) => {
    await asGuest.goto('/notifications');
    await expect(asGuest.getByText('로그인하면 알림을 받을 수 있어요')).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('알림 페이지 - 로그인 사용자', () => {
  test('키워드 공지 목록이 표시된다', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/notifications');
    await expect(asLoggedInUser.locator('.animate-spin')).toHaveCount(0, { timeout: 10_000 });
    // 목 데이터의 키워드 공지 제목 확인
    await expect(asLoggedInUser.getByText('장학금 안내')).toBeVisible({ timeout: 10_000 });
  });

  test('키워드 설정 바가 표시된다', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/notifications');
    await expect(asLoggedInUser.locator('.animate-spin')).toHaveCount(0, { timeout: 10_000 });
  });
});

test.describe('알림 페이지 - 반응형', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('모바일에서 전체 화면 모달로 표시된다', async ({ asGuest }) => {
    await asGuest.goto('/notifications');
    await expect(asGuest.getByText('알림').first()).toBeVisible({ timeout: 10_000 });
  });
});
