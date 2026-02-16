import { test, expect } from './fixtures/auth.fixture';

test.describe('친바 이벤트 상세 페이지 - 게스트', () => {
  test('FullPageModal이 렌더링된다', async ({ asGuest }) => {
    await asGuest.goto('/chinba/event?id=evt-001');
    await expect(asGuest.locator('.animate-spin')).toHaveCount(0, { timeout: 10_000 });
  });

  test('이벤트 제목이 표시된다', async ({ asGuest }) => {
    await asGuest.goto('/chinba/event?id=evt-001');
    await expect(asGuest.getByRole('heading', { name: '조별과제 회의' }).first()).toBeVisible({ timeout: 10_000 });
  });

  test('공유 버튼이 있다', async ({ asGuest }) => {
    await asGuest.goto('/chinba/event?id=evt-001');
    await expect(asGuest.getByTitle('공유')).toBeVisible({ timeout: 10_000 });
  });

  test('링크 복사 버튼이 있다', async ({ asGuest }) => {
    await asGuest.goto('/chinba/event?id=evt-001');
    await expect(asGuest.getByTitle('링크 복사')).toBeVisible({ timeout: 10_000 });
  });

  test('이벤트 ID 없이 접근 시 에러 UI가 표시된다', async ({ asGuest }) => {
    await asGuest.goto('/chinba/event');
    await expect(asGuest.getByText('이벤트를 찾을 수 없습니다')).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('친바 이벤트 상세 - 로그인 사용자 (생성자)', () => {
  test('이벤트 상세가 표시된다', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/chinba/event?id=evt-001');
    await expect(asLoggedInUser.getByRole('heading', { name: '조별과제 회의' }).first()).toBeVisible({ timeout: 10_000 });
  });

  test('전체 일정 / 내 일정 탭이 표시된다', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/chinba/event?id=evt-001');
    await expect(asLoggedInUser.getByRole('button', { name: '전체 일정' })).toBeVisible({ timeout: 10_000 });
    await expect(asLoggedInUser.getByRole('button', { name: '내 일정' })).toBeVisible({ timeout: 10_000 });
  });

  test('생성자에게 완료 처리 버튼이 표시된다', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/chinba/event?id=evt-001');
    await expect(asLoggedInUser.getByTitle('완료 처리')).toBeVisible({ timeout: 10_000 });
  });

  test('생성자에게 삭제 버튼이 표시된다', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/chinba/event?id=evt-001');
    // 공유 버튼이 보이면 그 옆에 삭제 버튼(이름 없는 마지막 버튼)도 있음
    const shareBtn = asLoggedInUser.getByTitle('공유');
    await expect(shareBtn).toBeVisible({ timeout: 10_000 });
    // 공유 버튼의 부모 div 내 마지막 버튼이 삭제 버튼
    const deleteBtn = shareBtn.locator('xpath=..').locator('button').last();
    await expect(deleteBtn).toBeVisible();
  });

  test('탭 전환이 동작한다', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/chinba/event?id=evt-001');
    await asLoggedInUser.getByRole('button', { name: '내 일정' }).click();
    await expect(asLoggedInUser).toHaveURL(/tab=my/);
  });
});
