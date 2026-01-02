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

- **app/page.tsx**: Main page with state management (notices, loading, tab, filtering)
- **app/components/NoticeCard.tsx**: Individual notice display with category badge, date, and external link
- **app/components/TabBar.tsx**: Horizontal scrollable tab navigation with auto-scroll to active tab
- **app/components/CategoryFilterModal.tsx**: Modal for selecting which categories to display
- **app/components/CategoryBadge.tsx**: Colored badge component for category labels
- **app/hooks/useSelectedCategories.ts**: Custom hook managing category selection state with localStorage
- **app/lib/api.ts**: Axios instance and API functions (`fetchNotices`, `triggerCrawl`)
- **app/lib/categories.ts**: Category configuration and utility functions

### Responsive Design

- **Mobile (default)**: Full-width list view with native app-like experience
- **Tablet/Desktop (md breakpoint)**: Centered layout (max-width: 768px/1024px), card grid view with borders and shadows
- Container max-width: `max-w-md` (mobile), `md:max-w-4xl` (tablet+)

### Styling

- **Tailwind CSS v4** with custom safelist for dynamic color classes (see `tailwind.config.js:8-16`)
- **Dynamic classes**: Category colors are applied via string interpolation and must be safelisted to prevent purging in production builds
- **Inter font** from Google Fonts
- **Korean locale**: dayjs configured with Korean locale for relative time display

### State Management

Uses React hooks (no external state library):
- `useState` for notices, loading states, active tab
- `useEffect` for initial data fetch and scroll management
- `useRef` for scroll container and tab references
- Custom `useSelectedCategories` hook for category filter state with localStorage persistence

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

- **API timeout**: 5 seconds (configured in `app/lib/api.ts:8`)
- **Notice interface**: Must match backend model (`id`, `title`, `link`, `date`, `category`, `crawled_at`)
- **Tab system**: "all" tab shows all notices, other tabs filter by category ID
- **Scroll behavior**: Tab changes trigger smooth scroll to top of notice list
- **"New" indicator**: Red pulse dot appears for notices with today's date
- **Loading skeleton**: 6 placeholder items shown during data fetch
