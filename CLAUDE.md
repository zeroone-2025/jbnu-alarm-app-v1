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
- **Tablet/Desktop (md breakpoint)**: Centered layout (max-width: 768px/1024px), card grid view with borders and shadows
- Container max-width: `max-w-md` (mobile), `md:max-w-4xl` (tablet+)

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
   - `LATEST`: Shows all notices (same as ALL, sorted by date)
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
