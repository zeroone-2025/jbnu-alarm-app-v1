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
- **백엔드 서버:** 이 프론트엔드는 `http://localhost:8000`에서 실행되는 백엔드 API에 의존합니다.

### 2. 설치 (Installation)

저장소를 클론하고 패키지를 설치합니다.

```bash
git clone https://github.com/zeroone-2025/jbnu-alarm-app-v1.git
cd jbnu-alarm-app-v1
npm install
```

### 3. 프로젝트 설정 (Configuration)

현재 API 엔드포인트는 코드 내에 하드코딩되어 있습니다. 백엔드 주소가 다르다면 아래 파일을 수정하세요.

- **파일 위치:** `app/lib/api.ts`

```typescript
// app/lib/api.ts
const API_BASE_URL = 'http://localhost:8000'; // 이 부분을 본인의 백엔드 주소로 변경
```

### 4. 실행 (Run)

개발 서버를 실행합니다.

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 확인합니다.

## 📂 폴더 구조 (Directory Structure)

```
jbnu-alarm-app-v1/
├── app/
│   ├── layout.tsx      # 전역 레이아웃 (폰트, 메타데이터)
│   ├── page.tsx        # 메인 페이지 (UI 로직, 상태 관리)
│   ├── globals.css     # Tailwind 지시어 및 전역 스타일
│   └── lib/
│       └── api.ts      # Axios 인스턴스 및 API 호출 함수 모음
├── public/             # 정적 에셋 (아이콘, 이미지)
├── eslint.config.mjs   # ESLint 설정
├── tailwind.config.js  # Tailwind 설정
└── tsconfig.json       # TypeScript 설정
```

## 🔗 API 연동 규격

프론트엔드는 다음 백엔드 API가 필요합니다.

| Method | Endpoint | Description |
|Data | ------ | ----------- |
| `GET` | `/notices?skip=0&limit=100` | 공지사항 목록 조회 |
| `POST` | `/notices/crawl` | 크롤러 수동 트리거 요청 |

## 🤝 기여하기 (Contributing)

이슈 제보와 Pull Request는 언제나 환영합니다.

1. 이 저장소를 Fork 합니다.
2. 새로운 Feature 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`).
3. 변경 사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`).
4. 브랜치에 Push 합니다 (`git push origin feature/AmazingFeature`).
5. Pull Request를 요청합니다.
