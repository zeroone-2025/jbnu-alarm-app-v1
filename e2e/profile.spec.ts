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
    // 닉네임 입력 필드에 유저 이름이 있으면 프로필 페이지 로드 완료
    await expect(asLoggedInUser.getByPlaceholder('이름을 입력하세요')).toHaveValue('테스트유저');
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

  test('커리어 관리는 FLOW 내 이력 화면에서 접근한다', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/flow/career');
    await expect(asLoggedInUser.locator('.animate-spin')).toHaveCount(0, { timeout: 10_000 });
    await expect(asLoggedInUser.getByText('내 이력')).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('프로필 페이지 - 반응형', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('모바일에서 프로필이 정상 표시된다', async ({ asLoggedInUser }) => {
    await asLoggedInUser.goto('/profile');
    await expect(asLoggedInUser.locator('.animate-spin')).toHaveCount(0, { timeout: 10_000 });
    // 닉네임 입력 필드 확인
    await expect(asLoggedInUser.getByPlaceholder('이름을 입력하세요')).toHaveValue('테스트유저');
  });
});
