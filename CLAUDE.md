# CLAUDE.md

JBNU Notice Alarm — Next.js 기반 대학 공지 알림 웹/네이티브 앱

## Overview

전북대학교 150개+ 게시판 공지를 구독 기반으로 보여주는 프론트엔드. Next.js 16 + Capacitor(iOS/Android) + PWA로 웹/네이티브 동시 지원. 백엔드 API 서버(`localhost:8080`)에서 데이터를 가져오며, 키워드 알림/즐겨찾기/읽음 추적/친바(일정조율)/시간표/커리어 프로필 기능 포함.

## Development Commands

```bash
npm install              # 의존성 설치
npm run dev              # 개발 서버 (http://localhost:3000)
npm run build            # 프로덕션 빌드
npm run lint             # ESLint
npm run test:e2e         # Playwright E2E 테스트
```

## Backend Dependency

백엔드: `http://localhost:8080` (기본값). 환경변수로 변경 가능:
- `NEXT_PUBLIC_API_BASE_URL_WEB` — 웹/SSR용
- `NEXT_PUBLIC_API_BASE_URL_NATIVE` — Capacitor 네이티브용

플랫폼 감지 로직: `app/_lib/api/client.ts`의 `getApiBaseUrl()` 참조.

## Directory Convention

Next.js 13+ private folder 컨벤션 사용 — 언더스코어 접두사 디렉토리는 라우팅에서 제외:

- `app/_lib/` — API 클라이언트, hooks, 상수, store (상세: `app/_lib/CLAUDE.md`)
- `app/_components/` — 공유 컴포넌트 (상세: `app/_components/CLAUDE.md`)
- `app/_context/` — React Context providers
- `app/_types/` — TypeScript 타입 정의

### Route Groups

- `app/(auth)/` — 로그인, OAuth 콜백, 온보딩
- `app/(main)/` — 메인 앱 (홈, 필터, 친바, 시간표, 프로필, 키워드, 알림 등)
- 각 라우트는 자체 `_components/`, `_hooks/` 폴더를 가질 수 있음

## Architecture

### State Management

- **Zustand** (`app/_lib/store/useUserStore.ts`) — 사용자 전역 상태
- **React Query** (`@tanstack/react-query`) — 서버 상태 (공지 목록, 무한 스크롤 등)
- **localStorage** — 구독 게시판 설정 (`useSelectedCategories` hook)

### Filtering Pipeline

`app/(main)/(home)/page.tsx`에서 2단계 필터링:

1. **게시판 구독 필터** — `selectedCategories`로 구독한 게시판만 표시
2. **카테고리 필터** — `ALL` / `UNREAD` / `KEYWORD` / `FAVORITE`

### Authentication

OAuth 2.0 → JWT. Access Token은 메모리, Refresh Token은 HttpOnly 쿠키.
Axios interceptor로 401 시 자동 토큰 리프레시 (큐 기반). 상세: `app/_lib/api/client.ts`

### Board System

`app/_lib/constants/boards.ts`의 `BOARD_MAP` — 150개+ 게시판 정의.
각 게시판: `{ name, color, category }`. 카테고리: 전북대/단과대/학과/사업단.

## Styling

- **Tailwind CSS v4** — `@import "tailwindcss"` 구문 사용
- **Custom md breakpoint**: 832px (`52rem`) — 태블릿 호환 (`app/globals.css` @theme)
- **동적 색상 safelist**: `tailwind.config.js`에 bg/text 색상 패턴 등록
- **Custom CSS**: `no-scrollbar`, safe-area 유틸리티, fadeIn/slideUp 애니메이션 (`app/globals.css`)

## Key Dependencies

| 패키지 | 용도 |
|--------|------|
| Next.js 16 + React 19 | 프레임워크 |
| @capacitor/* 8.x | iOS/Android 네이티브 빌드 |
| @ducanh2912/next-pwa | PWA + Service Worker |
| @tanstack/react-query | 서버 상태 관리 |
| zustand | 클라이언트 전역 상태 |
| axios | HTTP 클라이언트 + JWT interceptor |
| dayjs | 날짜 처리 (Korean locale) |
| react-icons | 아이콘 |
| react-intersection-observer | 무한 스크롤 |
| Playwright | E2E 테스트 |

## Code Style

ESLint 설정:
- Next.js core-web-vitals + TypeScript 규칙
- Import 순서: React → 외부 패키지 → 내부 alias (`@/_lib/*`, `@/_components/*`) → 상대 경로
- unused vars: error / explicit any: warn
- Prettier 통합

## Git Conventions

### Commit Message Format

```
<type>(<scope>): <설명>

Refs #이슈번호
```

**타입 (필수)**:
| 타입 | 용도 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |
| `style` | 코드 포맷팅 (비즈니스 로직 변경 없음) |
| `refactor` | 코드 리팩토링 (기능 변화 없음) |
| `perf` | 성능 개선 |
| `test` | 테스트 코드 추가/수정 |
| `build` | 빌드 설정, 의존성 수정 |
| `chore` | 잡일, 설정 파일 등 |
| `ci` | CI/CD 파이프라인 변경 |

**스코프 (선택)**: `auth`, `alarm`, `chinba`, `ui`, `filter`, `keywords`, `profile`, `notification`, `timetable` 등

**예시**:
```
feat(chinba): 이벤트 생성 페이지 추가
fix(auth): OAuth 콜백 토큰 파싱 오류 수정
refactor(ui): FullPageModal 레이아웃 개선
```

### Branch Naming

```
<type>/#<이슈번호>-<짧은설명>
```

타입: `feature/`, `fix/`, `hotfix/`, `refactor/`, `docs/`

### Epic Branch 전략

```
dev (기본 브랜치)
 └── feature/#10-social-login          ← Epic 브랜치
      ├── feature/#10-login-ui         ← Epic에서 분기 → Epic으로 머지
      ├── feature/#11-login-api
      └── feature/#12-login-token
```

규칙:
1. Epic 브랜치는 `dev`에서 분기, 대표 이슈 번호 사용
2. 하위 브랜치는 Epic에서 분기, 완료 후 Epic으로 PR/머지
3. 모든 하위 작업 완료 후 Epic → `dev` PR
4. 이슈 2개 이하로 밀접하면 하나의 브랜치에서 커밋으로 구분 가능

### AI 커밋/브랜치 규칙

1. 변경 내용 분석 → 적절한 타입 자동 선택
2. 변경 모듈에 따라 scope 자동 부여
3. 이슈 번호 제공 시 브랜치 네이밍 규칙 준수
4. 커밋 메시지는 한글, 타입/스코프는 영문
5. 반드시 위 컨벤션을 따름
