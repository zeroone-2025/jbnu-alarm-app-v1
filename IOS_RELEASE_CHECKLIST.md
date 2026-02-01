# iOS App Store Release Checklist

이 문서는 iOS 앱을 App Store에 배포하기 위해 필요한 설정과 확인 절차를 정리한 체크리스트입니다.
Antigravity가 이미 적용한 설정과 사용자가 직접 Xcode에서 확인해야 할 항목이 구분되어 있습니다.

## ✅ 이미 적용된 설정 (Antigravity 작업 완료)

### 1. 앱 아이콘 및 스플래시 스크린
- **아이콘**: `public/logo-symbol.svg` (심볼 로고)를 사용했습니다.
- **스플래시**: `public/logo.svg` (풀 텍스트 로고)를 사용했으며, 배경색을 **흰색(#ffffff)**으로 설정했습니다.
- **적용 방식**: `@capacitor/assets` 도구를 설치하고 `assets/` 자산을 생성한 뒤, iOS 프로젝트(`ios/App/App/Assets.xcassets`)에 이미지를 생성했습니다.

### 2. 개인정보 보호 (Privacy & Encryption)
- **수출 규정(Encryption)**: `Info.plist`에 `ITSAppUsesNonExemptEncryption`을 `NO`로 설정했습니다. (HTTPS 등 표준 암호화만 사용하는 경우 필수 설정)
- **개인정보 매니페스트(Privacy Manifest)**: `ios/App/App/PrivacyInfo.xcprivacy` 파일을 생성했습니다.
  - **UserDefaults**: 앱 설정 저장용 (필수 사유 `CA92.1` 기재)
  - **FileTimestamp**: 파일 관리용 (필수 사유 `C617.1` 기재)

### 3. Capacitor 설정
- **배경색**: `capacitor.config.ts`에서 스플래시 스크린 배경색을 흰색으로 변경했습니다.

---

## 🛠 사용자가 직접 확인/수행해야 할 항목 (Xcode 작업)

터미널에서 `npx cap open ios`를 실행하여 Xcode를 열고 다음을 수행하세요.

### 1. PrivacyInfo.xcprivacy 파일 등록 (중요!)
자동으로 생성된 `PrivacyInfo.xcprivacy` 파일이 Xcode 프로젝트 탐색기에 보이지 않을 수 있습니다.
- Xcode 좌측 탐색기에서 `App` 폴더(노란색)를 찾습니다.
- Finder에서 `ios/App/App/PrivacyInfo.xcprivacy` 파일을 끌어다 Xcode의 `App` 그룹 안에 놓습니다.
- 팝업 창에서 **"Copy items if needed"** 체크 해제, **"Add to targets"**에서 `App`을 체크하고 [Finish]를 누릅니다.

### 2. 서명 및 기능 (Signing & Capabilities)
- 프로젝트 최상단 `App` 클릭 -> TARGETS `App` 선택 -> **Signing & Capabilities** 탭.
- **Team**: Apple Developer Account에 등록된 팀을 선택하세요.
- **Bundle Identifier**: `kr.zerotime.app`이 맞는지 확인하세요.
- 빨간색 경고(Signing Certificate 등)가 없는지 확인하세요.

### 3. 버전 관리
- **General** 탭 -> **Identity** 섹션.
- **Version**: `1.0` (사용자에게 보이는 버전)
- **Build**: `1` (내부 빌드 번호, App Store Connect에 올릴 때마다 1씩 증가시켜야 함)

### 4. 스플래시 스크린 확인
- 시뮬레이터(Cmd+R)를 실행하여 앱이 켜질 때 로고가 흰색 배경에 정상적으로 뜨는지 확인하세요.
- 다크 모드에서도 흰색 배경이 유지되는지(의도한 대로인지) 확인하세요. 어색하다면 `GlobalConfig`나 `Assets` 수정이 필요할 수 있습니다.

### 5. 아카이브 및 배포 (Archive & Upload)
- 시뮬레이터 대신 **Any iOS Device (arm64)**를 선택합니다.
- 상단 메뉴 **Product** -> **Archive** 를 실행합니다. (빌드 시간이 조금 걸립니다.)
- **Archives (Organizer)** 창이 자동으로 열립니다. (안 열리면 상단 메뉴 **Window** -> **Organizer** 클릭)
- 가장 최신 아카이브를 선택하고 우측의 **[Distribute App]** 버튼을 클릭합니다.
- **App Store Connect** -> **Upload** -> **Next** 계속 클릭 (기본 설정 유지) -> **Upload**.

---

## ❓ 자주 발생하는 오류 (Troubleshooting)

### 🚨 "Your team has no devices..." / "No profiles for..." 오류
**원인**: Apple 개발자 계정에 등록된 물리적 iOS 기기(iPhone/iPad)가 하나도 없어서, Xcode가 *개발용(Development)* 프로파일을 생성하지 못하는 상황입니다. (앱스토어 배포용이라도 Xcode는 기본적으로 개발 환경을 먼저 세팅하려 합니다.)

**해결 방법**:
1. **가장 쉬운 방법 (기기가 있는 경우)**:
   - Mac에 아이폰을 케이블로 연결하세요.
   - Xcode 상단 기기 선택 메뉴(현재 'Any iOS Device'로 되어있는 곳)를 눌러 연결된 아이폰을 선택하세요.
   - Xcode가 "Register Device"를 할 것인지 물어보면 승인하세요.
   - 다시 Signing & Capabilities 탭으로 돌아가 'Try Again'을 누르면 자동으로 해결됩니다.

2. **기기가 없는 경우 (수동 설정)**:
   - [Apple Developer 사이트](https://developer.apple.com/account/resources/profiles/list)에 접속합니다.
   - **Profiles** -> **+** 버튼 클릭 -> **Registration** 대신 **Distribution** -> **App Store** 선택.
   - App ID(`kr.zerotime.app`)를 선택하고 프로파일을 생성 및 다운로드합니다.
   - Xcode에서 **Automatically manage signing** 체크를 **해제**합니다.
   - **Signing (Release)** 섹션에서 다운로드한 프로파일을 직접 선택합니다. (Signing Certificate는 'Apple Distribution' 선택)

### 🌓 다크 모드 스플래시 배경색 설정
`capacitor.config.ts`에서는 단일 배경색만 설정 가능하므로, 다크 모드에서 배경을 검정색으로 하려면 Xcode 수정이 필요합니다.
1. `Assets.xcassets`를 엽니다.
2. 빈 곳에 우클릭 -> **New Color Set** -> 이름을 'SplashBackground'로 지정.
3. **Any Appearance**는 `#FFFFFF`(흰색), **Dark**는 `#111827`(검정색)으로 설정.
4. `LaunchScreen.storyboard`를 엽니다.
5. 최상위 **View**를 클릭하고 우측 속성 창에서 **Background**를 `SplashBackground`로 변경합니다.
(만약 어렵다면 시스템 기본값인 System Background Color를 사용하도록 설정해도 됩니다.)

---

## 💡 주의사항 (Review Guidelines)
- **로그인**: 소셜 로그인(구글 등)이 있다면, Apple 로그인도 반드시 포함되어야 합니다. (없으면 리젝 사유) -> *현재 구글 로그인만 있는 경우 주의 필요*
- **앱 완성도**: 앱에 깨진 링크나 '테스트'라는 단어가 포함된 더미 데이터가 없어야 합니다.
- **권한 설명**: 카메라, 위치 등 권한 요청 시 뜨는 문구(Usage Description)가 명확해야 합니다. (현재 추가 권한이 없어 보이지만, 추후 추가 시 `Info.plist` 수정 필요)
