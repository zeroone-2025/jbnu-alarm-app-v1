# 게스트 필터 마이그레이션 가이드

## 문제 상황

기존 사용자들의 localStorage에 구 버전 필터 데이터(`home_campus`만 저장)가 남아있어, 새로운 기본값(7개 게시판)이 적용되지 않는 문제가 있었습니다.

## 해결 방법

**버전 기반 자동 마이그레이션** 시스템을 구현했습니다.

### 작동 원리

1. **버전 관리**
   - `GUEST_DEFAULT_BOARDS` 배열의 길이를 버전으로 사용
   - localStorage에 `JB_ALARM_GUEST_FILTER_VERSION` 키로 버전 저장

2. **마이그레이션 조건**
   ```typescript
   const needsMigration = !savedVersion || savedVersion !== currentVersion;
   ```
   - 버전 정보가 없거나
   - 저장된 버전이 현재 버전과 다르면
   → 새 기본값으로 **자동 덮어쓰기**

3. **사용자 경험**
   - 기존 사용자: 다음 방문 시 자동으로 7개 게시판으로 업데이트
   - 신규 사용자: 처음부터 7개 게시판으로 시작
   - 로그인 사용자: 영향 없음 (DB 기반)

### 구현 파일

- `app/_lib/constants/boards.ts`: `GUEST_FILTER_VERSION` 상수 추가
- `app/_lib/hooks/useSelectedCategories.ts`: 마이그레이션 로직 구현

### 기본값 변경 시 해야 할 일

`GUEST_DEFAULT_BOARDS` 배열을 수정하면 자동으로 마이그레이션됩니다:

```typescript
// boards.ts
export const GUEST_DEFAULT_BOARDS = [
  'home_campus', 'home_student', 'home_lecture',
  'home_news', 'home_contest', 'home_parttime', 
  'agency_sw', // ← 새 게시판 추가
];
```

배열 길이가 변경되면 버전이 자동으로 업데이트되어 모든 기존 사용자가 새 기본값을 받게 됩니다.

### 테스트 방법

1. **기존 데이터 시뮬레이션**
   ```javascript
   // 브라우저 콘솔에서
   localStorage.setItem('JB_ALARM_GUEST_FILTER', '["home_campus"]');
   localStorage.removeItem('JB_ALARM_GUEST_FILTER_VERSION');
   location.reload();
   ```

2. **확인**
   - 필터 설정 확인 → 7개 게시판이 선택되어 있어야 함
   - localStorage 확인 → 버전이 "7"로 저장되어 있어야 함

### 주의사항

- 로그인 사용자는 DB 기반이므로 영향 없음
- 사용자가 직접 변경한 필터는 버전이 같으면 유지됨
- 기본값 변경 시 모든 게스트 사용자가 영향을 받음
