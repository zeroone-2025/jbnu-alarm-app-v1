# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JBNU Notice Alarm is a Next.js web application that aggregates and displays university notices from Jeonbuk National University (JBNU) homepage and Computer Science & AI department. The frontend fetches notices from a backend API (expected at `http://localhost:8000`) and provides category filtering, manual refresh/crawling, and a responsive UI.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run linter
npm run lint
```

## Backend Dependency

This frontend requires a backend server running at `http://localhost:8000` with these endpoints:
- `GET /notices?skip=0&limit=100` - Fetch notices
- `POST /notices/crawl` - Trigger manual crawling

To change the API endpoint, modify `API_BASE_URL` in `app/lib/api.ts:4`.

## Architecture

### Data Flow
1. **Client-side filtering**: The app fetches 100 notices from the backend and performs filtering on the client side (tab filtering + category filtering). This is noted as an MVP approach that could be optimized with server-side filtering later (see `app/page.tsx:46`).

2. **Manual refresh flow**: When user clicks refresh button, it:
   - Triggers backend crawl (`POST /notices/crawl`)
   - Waits 1 second for database updates
   - Re-fetches notice list
   (See `app/page.tsx:57-68`)

3. **localStorage persistence**: Selected categories are saved to localStorage using the `useSelectedCategories` hook to persist user preferences across sessions.

### Category System

The category system is centralized in `app/lib/categories.ts` and designed for easy extension:

- **Adding new categories**: Add an entry to `CATEGORY_CONFIGS` array in `app/lib/categories.ts:73-93`
- **Color palette**: 10 pre-defined colors cycle for unlimited categories
- **Category structure**: Each category has `id` (must match API), `label` (display name), `color` (theme), and `order` (display order)

Current categories: `homepage` (학교공지), `csai` (컴인지)

### Component Structure

- **app/(home)/page.tsx**: Main page with state management (notices, loading, filtering). Supports client-side filtering by read status, favorites, and board subscriptions.
- **app/components/CategoryFilter.tsx**: 당근마켓 스타일 필터 바 - 좌측 고정 설정 버튼(FiSliders 아이콘) + 우측 가로 스크롤 필터 칩 (전체/안읽음/최신공지/즐겨찾기). Sticky positioning으로 스크롤 시 상단 고정.
- **app/components/Sidebar.tsx**: Left sidebar with login/logout functionality and menu options
- **app/components/NoticeCard.tsx**: Individual notice display with category badge, date, and external link
- **app/components/TabBar.tsx**: Horizontal scrollable tab navigation with auto-scroll to active tab
- **app/components/CategoryFilterModal.tsx**: Modal for selecting which categories to display
- **app/components/CategoryBadge.tsx**: Colored badge component for category labels
- **app/hooks/useSelectedCategories.ts**: Custom hook managing category selection state with localStorage
- **app/api/index.ts**: Axios instance with JWT interceptor and API functions (`fetchNotices`, `triggerCrawl`, `markNoticeAsRead`)
- **app/constants/boards.ts**: Board metadata (BOARD_MAP) with UI information

**Note:** BottomNav component has been removed to maximize screen space. All navigation is now handled through the Sidebar component.

### Responsive Design

- **Mobile (default)**: Full-width list view with native app-like experience
- **Desktop (md breakpoint, 832px로 커스텀)**: 사이드바(260px) 포함 데스크톱 레이아웃, card grid view with borders and shadows
- Apple App Store 태블릿 호환을 위해 md breakpoint를 832px로 상향 (globals.css @theme), 사이드바 260px로 축소
- Container max-width: `max-w-md` (mobile), `md:max-w-[calc(260px+56rem)]` (desktop)

### Styling

- **Tailwind CSS v4** with custom safelist for dynamic color classes (see `tailwind.config.js:8-16`)
- **Dynamic classes**: Category colors are applied via string interpolation and must be safelisted to prevent purging in production builds
- **Inter font** from Google Fonts
- **Korean locale**: dayjs configured with Korean locale for relative time display
- **Custom CSS classes**: `no-scrollbar` and `scrollbar-hide` for hiding scrollbars on horizontal scroll containers (see `app/globals.css:3-13`)

### State Management

Uses React hooks (no external state library):
- `useState` for notices, loading states, active filter (전체/안읽음/즐겨찾기)
- `useEffect` for initial data fetch, scroll management, and login status handling
- `useRef` for scroll container and tab references
- Custom `useSelectedCategories` hook for board subscription state with localStorage persistence

### Filtering System

The app implements a **two-stage filtering pipeline**:

1. **Board subscription filter** (`selectedCategories`): Filters notices by user-subscribed boards (configured in onboarding or settings)
2. **Category filter** (`filter` state): Further filters by:
   - `ALL`: Shows all subscribed notices
   - `UNREAD`: Shows only unread notices (`is_read === false`)
   - `FAVORITE`: Shows only favorited notices (`is_favorite === true`)

Filtering logic is implemented client-side in `app/(home)/page.tsx:173-182`.

## Code Style & Linting

ESLint is configured with:
- Next.js core-web-vitals and TypeScript rules
- Import order enforcement (React first, then external, internal, relative)
- TypeScript rules: error on unused vars, warn on explicit any
- Prettier integration to avoid conflicts

When adding imports, follow this order:
1. React imports
2. External dependencies (axios, dayjs, etc.)
3. Internal aliases (@/lib/*, @/components/*)
4. Relative imports

## Important Implementation Notes

- **API timeout**: 5 seconds (configured in `app/api/index.ts:8`)
- **Notice interface**: Must match backend model (`id`, `title`, `link`, `date`, `board_code`, `view`, `is_read`, `is_favorite`, `created_at`)
- **Authentication**: OAuth 2.0 flow with Google. JWT tokens stored in localStorage and automatically added to API requests via axios interceptor.
- **Scroll behavior**: Tab changes trigger smooth scroll to top of notice list
- **"New" indicator**: Red pulse dot appears for notices with today's date
- **Loading skeleton**: 6 placeholder items shown during data fetch
- **Layout**: Full-screen layout without bottom navigation bar (removed for maximum screen space). Navigation handled through left sidebar.

## Git Conventions

### Commit Message Format

```
<type>(<scope>): <설명>

# 관련 이슈가 있으면 본문 또는 footer에 참조
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

**스코프 (선택)**: `auth`, `alarm`, `chinba`, `ui`, `filter`, `keywords`, `profile`, `notification` 등

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

**타입**: `feature/`, `fix/`, `hotfix/`, `refactor/`, `docs/`

**예시**:
```
feature/#12-chinba-event
fix/#45-notification-badge
hotfix/#99-auth-redirect
```

### Epic Branch 전략 (연관 이슈 묶음)

하나의 큰 기능이 여러 이슈로 나뉠 때, Epic 브랜치를 사용한다.

```
dev (기본 브랜치)
 └── feature/#10-social-login          ← Epic 브랜치 (dev에서 분기)
      ├── feature/#10-login-ui         ← Epic에서 분기, 완료 후 Epic으로 머지
      ├── feature/#11-login-api        ← Epic에서 분기, 완료 후 Epic으로 머지
      └── feature/#12-login-token      ← Epic에서 분기, 완료 후 Epic으로 머지
```

**규칙**:
1. Epic 브랜치는 `dev`에서 분기하고, 대표 이슈 번호를 사용한다
2. 하위 브랜치들은 Epic 브랜치에서 분기하고, 완료 후 Epic으로 PR/머지한다
3. 모든 하위 작업이 완료되면 Epic 브랜치를 `dev`로 PR한다
4. 이슈가 2개 이하로 밀접하게 연관되면, 하나의 브랜치에서 커밋 메시지로 이슈를 구분해도 된다

### AI 커밋/브랜치 자동 판단 규칙

Claude가 커밋 또는 브랜치를 생성할 때:
1. 변경 내용을 분석하여 적절한 커밋 타입을 자동 선택한다
2. 변경된 모듈에 따라 scope를 자동 부여한다
3. 브랜치 생성 시 이슈 번호가 제공되면 네이밍 규칙을 따른다
4. 커밋 메시지는 한글로 작성하되, 타입과 스코프는 영문으로 한다
5. **반드시 위 컨벤션을 따르며, 규칙에 맞지 않는 커밋/브랜치를 만들지 않는다**
