# JBNU Notice Alarm (Frontend)
 
전북대학교 공지사항과 컴퓨터인공지능학부 공지사항을 한곳에서 모아보고, 최신 데이터를 크롤링할 수 있는 웹 애플리케이션의 프론트엔드입니다.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8)

## ✨ 주요 기능 (Key Features)

- **📄 통합 공지 확인:** 학교 홈페이지와 학과 홈페이지(CS/AI)의 공지사항을 통합 리스트로 제공
- **🏷️ 카테고리 필터링:** 탭 메뉴를 통해 원하는 카테고리(전체, 학교공지, 컴인지)만 필터링
- **📱 반응형 디자인:**
  - **Mobile:** 네이티브 앱과 유사한 리스트 뷰
  - **Tablet/Desktop:** 넓은 화면을 활용한 카드 그리드 뷰 및 중앙 정렬 레이아웃
- **⚡ 실시간 데이터 갱신:** '새로고침' 버튼을 통해 즉시 크롤러를 트리거하고 최신 데이터 반영
- **🖱️ UX 최적화:** 탭 이동 시 자동 스크롤 초기화, 로딩 스켈레톤 UI 적용

## 🛠 기술 스택 (Tech Stack)

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **State Management:** React Hooks (`useState`, `useEffect`, `useRef`)
- **Data Fetching:** Axios
- **Utils:** Day.js (날짜 포맷팅), React Icons

## 🚀 시작하기 (Getting Started)

이 프로젝트를 로컬 환경에서 실행하기 위한 가이드입니다.

### 1. 필수 조건 (Prerequisites)

- Node.js v18 이상
- npm 또는 yarn
- **백엔드 서버:** 이 프론트엔드는 `http://localhost:8080`에서 실행되는 백엔드 API에 의존합니다.

### 2. 설치 (Installation)

저장소를 클론하고 패키지를 설치합니다.

```bash
git clone https://github.com/zeroone-2025/jbnu-alarm-app-v1.git
cd jbnu-alarm-app-v1
npm install
```

### 3. 프로젝트 설정 (Configuration)

환경 변수 파일을 통해 API 주소를 관리합니다.

- **개발 환경 (.env.development):** `http://localhost:8080`

### 4. 실행 및 배포 (Run & Deployment)

**개발 서버 실행:**

```bash
npm run dev
```

**배포용 빌드 및 실행:**

```bash
npm run build
npm run start
```

## 📂 폴더 구조 (Directory Structure)
**Feature-based Architecture**로 구성되어 있습니다.

```
jbnu-alarm-app-v1/
├── app/
│   ├── (routes)/            # 📍 모든 페이지 라우트
│   │   ├── (home)/          # 홈 화면
│   │   │   ├── page.tsx
│   │   │   └── _components/ # 홈 전용 컴포넌트
│   │   ├── keywords/        # 키워드 관리 화면
│   │   ├── notifications/   # 알림 화면
│   │   └── auth/            # 인증 관련
│   │
│   ├── _components/         # 🎨 전역 공통 컴포넌트
│   │   ├── layout/          # 레이아웃 (Sidebar 등)
│   │   ├── ui/              # 재사용 UI (Toast, Badge 등)
│   │   └── system/          # 시스템 (ServiceWorker 등)
│   │
│   ├── _lib/                # 🛠️ 유틸리티 & 로직
│   │   ├── api/             # 도메인별 API 클라이언트
│   │   ├── hooks/           # 커스텀 훅
│   │   ├── utils/           # 유틸리티 함수
│   │   └── constants/       # 상수 및 테마
│   │
│   ├── _types/              # 📝 TypeScript 타입 정의
│   │
│   └── layout.tsx           # 전역 레이아웃
├── public/                  # 정적 파일
├── .env.development         # 개발용 환경 변수
└── .env.production          # 배포용 환경 변수
```

## 🤝 기여하기 (Contributing)

이슈 제보와 Pull Request는 언제나 환영합니다.

1. 이 저장소를 Fork 합니다.
2. 새로운 Feature 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`).
3. 변경 사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`).
4. 브랜치에 Push 합니다 (`git push origin feature/AmazingFeature`).
5. Pull Request를 요청합니다.
