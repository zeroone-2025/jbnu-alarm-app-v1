# _lib Module

`app/_lib/` — API 클라이언트, hooks, 상수, 상태 저장소.

## API Client (`api/`)

- `client.ts` — Axios 인스턴스 설정
  - `getApiBaseUrl()`: SSR → `NEXT_PUBLIC_API_BASE_URL_WEB`, Native(Capacitor) → `NEXT_PUBLIC_API_BASE_URL_NATIVE`, Web → `NEXT_PUBLIC_API_BASE_URL_WEB`
  - `authApi`: 인터셉터 없는 인증 전용 인스턴스 (토큰 리프레시 요청용)
  - `api` (default): JWT 자동 첨부 + 401 시 토큰 리프레시 큐 처리
  - Timeout: 5초, `withCredentials: true` (HttpOnly 쿠키)

- API 모듈 (각 도메인별 분리):

| 파일 | 역할 |
|------|------|
| `notices.ts` | 공지 조회 (커서 기반 무한스크롤), 크롤링 트리거 |
| `auth.ts` | OAuth 로그인/로그아웃, 토큰 리프레시 |
| `user.ts` | 사용자 프로필, 설정 |
| `keywords.ts` | 키워드 CRUD, 구독, 매칭 공지 조회 |
| `chinba.ts` | 일정 조율 이벤트 생성/참여/결과 |
| `timetable.ts` | 시간표 CRUD, AI 이미지 분석 |
| `career.ts` | 커리어 프로필/학력/경력/자격증 |
| `boardGroups.ts` | 게시판 그룹 프리셋 |
| `departments.ts` | 학과 검색 |
| `stats.ts` | 사용자 통계 |

## Hooks (`hooks/`)

| Hook | 역할 |
|------|------|
| `useSelectedCategories` | 구독 게시판 선택 상태 (localStorage 영속) |
| `useUser` | 현재 로그인 사용자 정보 |
| `useUserStats` | 사용자 통계 (읽음/즐겨찾기 수 등) |
| `useCareer` | 커리어 프로필 CRUD |
| `useChinba` | 친바 이벤트 상태 관리 |
| `useNativeApp` | Capacitor 네이티브 앱 감지/딥링크 |
| `usePullToRefresh` | 당겨서 새로고침 (터치 이벤트 기반) |
| `useSmartBack` | 뒤로가기 네비게이션 (네이티브 호환) |

페이지별 hooks: `app/(main)/(home)/_hooks/`에 `useFilterState`, `useNoticeActions`, `useNoticeFiltering` 등.

## Constants (`constants/`)

- `boards.ts` — `BOARD_MAP`: 150개+ 게시판 메타데이터 (`{ name, color, category }`)
  - 카테고리: 전북대, 단과대, 학과, 사업단
  - 색상: blue, green, orange, indigo, sky, teal, gray 등
- `presets.ts` — 게시판 그룹 프리셋
- `theme.ts` — 테마 상수

## Store (`store/`)

- `useUserStore.ts` — Zustand 전역 상태 (사용자 정보, 로그인 상태)
