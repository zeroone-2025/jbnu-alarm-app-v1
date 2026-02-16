import { test, expect } from './fixtures/auth.fixture';

test.describe('프로필 페이지 - 게스트', () => {
  test('비로그인 시 홈으로 리다이렉트된다', async ({ asGuest }) => {
    await asGuest.goto('/profile');
    await expect(asGuest).toHaveURL('/', { timeout: 10_000 });
  });
});

test.describe('프로필 페이지 - 로그인 사용자', () => {
  test('프로필 정보가 표시된다', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/profile');
    await expect(asLoggedInUser.locator('.animate-spin')).toHaveCount(0, { timeout: 10_000 });
    // 프로필 탭이 표시되면 프로필 페이지 로드 완료
    await expect(asLoggedInUser.getByRole('button', { name: '기본정보' })).toBeVisible({ timeout: 10_000 });
    // 닉네임 입력 필드에 유저 이름이 있는지 확인
    await expect(asLoggedInUser.getByPlaceholder('닉네임을 입력하세요')).toHaveValue('테스트유저');
  });

  test('수정하기 버튼이 있다', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/profile');
    await expect(asLoggedInUser.locator('.animate-spin')).toHaveCount(0, { timeout: 10_000 });
    await expect(asLoggedInUser.getByText('수정하기')).toBeVisible({ timeout: 10_000 });
  });

  test('수정하기 클릭 시 편집 모드로 전환된다', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/profile');
    await expect(asLoggedInUser.locator('.animate-spin')).toHaveCount(0, { timeout: 10_000 });
    await asLoggedInUser.getByText('수정하기').click();
    // 취소 버튼이 나타남
    await expect(asLoggedInUser.getByText('취소')).toBeVisible();
    // 저장하기 버튼도 나타남
    await expect(asLoggedInUser.getByText('저장하기')).toBeVisible();
  });

  test('탭 전환이 동작한다', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/profile');
    await expect(asLoggedInUser.locator('.animate-spin')).toHaveCount(0, { timeout: 10_000 });

    // 시간표 탭 확인
    const timetableTab = asLoggedInUser.getByRole('button', { name: '시간표' });
    if (await timetableTab.isVisible()) {
      await timetableTab.click();
      // URL에 tab 파라미터 반영
      await expect(asLoggedInUser).toHaveURL(/tab=timetable/);
    }
  });
});

test.describe('프로필 페이지 - 반응형', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('모바일에서 프로필이 정상 표시된다', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/profile');
    await expect(asLoggedInUser.locator('.animate-spin')).toHaveCount(0, { timeout: 10_000 });
    // 프로필 탭이 표시되면 로드 완료
    await expect(asLoggedInUser.getByRole('button', { name: '기본정보' })).toBeVisible({ timeout: 10_000 });
    // 닉네임 입력 필드 확인
    await expect(asLoggedInUser.getByPlaceholder('닉네임을 입력하세요')).toHaveValue('테스트유저');
  });
});
