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

test.describe('키워드 배지 서버 동기화', () => {
  test('벨 클릭 시 PATCH /users/me에 keyword_notice_seen_at 전송', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/');
    await asLoggedInUser.locator('[aria-label="알림"]').waitFor({ timeout: 10_000 });

    const patchPromise = asLoggedInUser.waitForRequest(
      (req) => req.url().includes('/users/me') && req.method() === 'PATCH',
      { timeout: 15_000 }
    );

    await asLoggedInUser.locator('[aria-label="알림"]').click();
    const patchReq = await patchPromise;

    const body = JSON.parse(patchReq.postData() || '{}');
    expect(body).toHaveProperty('keyword_notice_seen_at');
    expect(body.keyword_notice_seen_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test('홈 키워드 탭에 빨간 점 배지가 없음', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/');
    await asLoggedInUser.locator('[aria-label="알림"]').waitFor({ timeout: 10_000 });

    await expect(asLoggedInUser.locator('.h-2.w-2.rounded-full.bg-red-500')).toHaveCount(0, {
      timeout: 5000,
    });
  });

  test('서버 seen_at 미래 값이면 배지 숫자 0', async ({ page }) => {
    const { mockAuthenticatedAPIs } = await import('./fixtures/api-mocks');
    const { MOCK_USER } = await import('./fixtures/test-data');

    await mockAuthenticatedAPIs(page, {
      user: { ...MOCK_USER, keyword_notice_seen_at: '2099-01-01T00:00:00Z' },
    });

    await page.goto('/');
    await page.locator('[aria-label="알림"]').waitFor({ timeout: 10_000 });

    await expect(page.locator('[aria-label="알림"] .bg-red-500')).toHaveCount(0, {
      timeout: 5000,
    });
  });
});
