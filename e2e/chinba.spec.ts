import { test, expect } from './fixtures/auth.fixture';

test.describe('친바 페이지 - 게스트', () => {
  test('페이지가 렌더링된다', async ({ asGuest }) => {
    await asGuest.goto('/chinba');
    await expect(asGuest.locator('.animate-spin')).toHaveCount(0, { timeout: 10_000 });
  });

  test('섹션 헤더가 표시된다', async ({ asGuest }) => {
    await asGuest.goto('/chinba');
    await expect(asGuest.getByText('내 친바 일정')).toBeVisible({ timeout: 10_000 });
  });

  test('생성 버튼이 있다', async ({ asGuest }) => {
    await asGuest.goto('/chinba');
    await expect(asGuest.getByText('생성')).toBeVisible({ timeout: 10_000 });
  });

  test('비로그인 시 빈 상태가 표시된다', async ({ asGuest }) => {
    await asGuest.goto('/chinba');
    await expect(asGuest.getByText('아직 참여 중인 친바가 없어요')).toBeVisible({ timeout: 10_000 });
  });

  test('생성 버튼 클릭 시 /chinba/create로 이동한다', async ({ asGuest }) => {
    await asGuest.goto('/chinba');
    await asGuest.getByText('생성').click();
    await expect(asGuest).toHaveURL(/\/chinba\/create/, { timeout: 10_000 });
  });
});

test.describe('친바 페이지 - 로그인 사용자', () => {
  test('이벤트 목록이 표시된다', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/chinba');
    await expect(asLoggedInUser.locator('.animate-spin')).toHaveCount(0, { timeout: 10_000 });
    // 목 데이터의 이벤트 제목 확인
    await expect(asLoggedInUser.getByText('조별과제 회의')).toBeVisible({ timeout: 10_000 });
  });
});
