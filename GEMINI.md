# JBNU Notice Alarm (Frontend)

## Project Overview

This is a **Next.js 16** web application designed to serve as a mobile-friendly frontend for the "JBNU & CSAI Notice Alarm" system. It displays university notices and allows users to manually trigger a crawler to fetch the latest data.

### Key Technologies

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **State/Data Fetching:** React Hooks (`useState`, `useEffect`), Axios
- **Utilities:** Day.js (date formatting), React Icons
- **Linting/Formatting:** ESLint, Prettier

## Building and Running

### Prerequisites

- Node.js (v20+ recommended)
- npm or compatible package manager
- A running backend instance (expected at `http://localhost:8000`)

### Commands

| Action                   | Command         | Description                                             |
| :----------------------- | :-------------- | :------------------------------------------------------ |
| **Install Dependencies** | `npm install`   | Installs all required packages.                         |
| **Development Server**   | `npm run dev`   | Starts the local dev server at `http://localhost:3000`. |
| **Build for Production** | `npm run build` | Compiles the application for production.                |
| **Start Production**     | `npm run start` | Runs the built application.                             |
| **Lint Code**            | `npm run lint`  | Runs ESLint to check for code quality issues.           |

## Development Conventions

### Directory Structure

- `app/` - Contains the App Router pages and layouts.
  - `page.tsx` - Main dashboard (notice list, tabs, refresh logic).
  - `layout.tsx` - Root layout (HTML structure, fonts, global styles).
  - `lib/` - Shared utilities.
    - `api.ts` - Axios instance and API service functions.
- `public/` - Static assets (images, icons).

### Architecture & patterns

- **API Communication:** All API calls are encapsulated in `app/lib/api.ts`. The app expects a REST API backend.
- **Styling:** Uses Tailwind CSS utility classes. The design is mobile-first, using a centered `max-w-md` container to mimic a mobile app experience on desktop.
- **Components:** This project currently uses a monolithic `page.tsx` for the main view. Future refactoring should consider breaking down the UI (Header, TabMenu, NoticeList) into smaller components.
- **Path Aliases:** `@/*` is configured in `tsconfig.json` to resolve to `./app/*`.

### Linting & Formatting

- **ESLint:** configured in `eslint.config.mjs`. Includes strict import ordering and TypeScript best practices.
- **Prettier:** configured in `prettier.config.js` (and `eslint-config-prettier`).
- **Rule:** Always run `npm run lint` before committing.

## Backend Dependency

The frontend is hardcoded to communicate with `http://localhost:8000` in `app/lib/api.ts`.

- **Notices Endpoint:** `GET /notices?skip=0&limit=20`
- **Crawl Trigger Endpoint:** `POST /notices/crawl`
