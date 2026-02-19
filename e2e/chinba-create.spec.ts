import { test, expect } from './fixtures/auth.fixture';

test.describe('친바 생성 페이지 - 게스트', () => {
  test('FullPageModal이 렌더링된다', async ({ asGuest }) => {
    await asGuest.goto('/chinba/create');
    await expect(asGuest.getByText('새 일정 만들기')).toBeVisible({ timeout: 10_000 });
  });

  test('뒤로가기 버튼이 있다', async ({ asGuest }) => {
    await asGuest.goto('/chinba/create');
    await expect(asGuest.getByRole('button', { name: '뒤로가기' })).toBeVisible({ timeout: 10_000 });
  });

  test('모임 이름 입력 필드가 있다', async ({ asGuest }) => {
    await asGuest.goto('/chinba/create');
    await expect(asGuest.getByText('모임 이름')).toBeVisible({ timeout: 10_000 });
    await expect(asGuest.getByPlaceholder('예: 조별과제 회의')).toBeVisible();
  });

  test('날짜 선택 영역이 있다', async ({ asGuest }) => {
    await asGuest.goto('/chinba/create');
    await expect(asGuest.getByText('날짜 선택')).toBeVisible({ timeout: 10_000 });
  });

  test('만들기 버튼이 있다', async ({ asGuest }) => {
    await asGuest.goto('/chinba/create');
    await expect(asGuest.getByRole('button', { name: '만들기' })).toBeVisible({ timeout: 10_000 });
  });

  test('입력 없이 만들기 버튼은 비활성화', async ({ asGuest }) => {
    await asGuest.goto('/chinba/create');
    const submitBtn = asGuest.getByRole('button', { name: '만들기' });
    await expect(submitBtn).toBeDisabled({ timeout: 10_000 });
  });
});

test.describe('친바 생성 페이지 - 로그인 사용자', () => {
  test('모임 이름 입력 후 글자수 카운터가 업데이트된다', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/chinba/create');
    const input = asLoggedInUser.getByPlaceholder('예: 조별과제 회의');
    await input.clear();
    await input.fill('테스트');
    await expect(asLoggedInUser.getByText('3/100')).toBeVisible();
  });
});
