## 1. Database Schema
### 1.1 ERD Overview
서비스는 Events(방), Participants(참가자), Users(회원), Availabilities(가능 시간) 4개의 핵심 테이블로 구성됩니다.

핵심 로직: Participants 테이블이 Users와 Events를 연결하며, 비회원일 경우 user_id를 NULL로 처리하여 하이브리드(회원+비회원) 방식을 지원합니다.

### 1.2 Table Details

| **Table Name** | **Column** | **Type** | **Description** |
| --- | --- | --- | --- |
| **Events** | `event_id` | UUID (PK) | URL로 공유될 고유 ID |
|  | `title` | VARCHAR | 모임 이름 |
|  | `dates` | JSON/ARRAY | 선택 가능한 날짜들 (예: `['2024-01-01', '2024-01-02']`) |
|  | `start_hour` | INT | 시작 시간 (예: 9 -> 09:00) |
|  | `end_hour` | INT | 종료 시간 (예: 22 -> 22:00) |
|  | `created_at` | DATETIME | 생성일 |
|  |  |  |  |
| **Participants** | `participant_id` | INT (PK) | 내부 식별 ID |
|  | `event_id` | UUID (FK) | 어느 모임의 참가자인지 |
|  | `user_id` | BIGINT (FK, Nullable) | ⭐ 핵심: 회원이면 ID, 비회원이면 NULL |
|  | `name` | VARCHAR | 사용자 이름 (화면에 표시) |
|  | `password` | VARCHAR | (선택) 수정 권한을 위한 간단한 비번 |
|  |  |  |  |
| **Users** (신규) | `user_id` | BIGINT (PK) | 회원 고유 ID |
|  | `email` | VARCHAR | 구글 이메일 (계정 식별용) |
|  | `provider` | VARCHAR | 'google’ |
|  | `provider_id` | VARCHAR | 구글에서 주는 고유 ID 값 |
|  |  |  |  |
| **Availabilities** | `id` | BIGINT (PK) |  |
|  | `participant_id` | INT (FK) | 누구의 시간인가 |
|  | `available_dt` | DATETIME | **가능한 시간 슬롯 (15분/30분 단위의 시작점)** |

## 2. API Documentation
- Base URL: /api (Router Context: /chinba)

### 2.1 이벤트 생성 (Create Event)새로운 일정 조율 방을 생성합니다.
- Method: POST
- URL: /api/events
- Request Body:
```JSON
{
  "title": "알고리즘 스터디 시간 정하기",
  "dates": ["2024-05-20", "2024-05-21"],
  "start_hour": 9,
  "end_hour": 22
}
```
- Response:
```JSON
{
  "event_id": "a1b2-c3d4",
  "link": "https://chinba/a1b2-c3d4"
}
```

### 2.2 이벤트 정보 및 현황 조회 (Get Event & Heatmap)
방 입장 시 그리드를 그리기 위한 정보와 현재까지 등록된 참가자들의 시간표 현황을 가져옵니다.
- Method: GET
- URL: /api/events/{event_id}
- Response:
```JSON
{
  "title": "알고리즘 스터디",
  "dates": ["2024-05-20", "2024-05-21"],
  "time_range": { "start": 9, "end": 22 },
  "participants": [
    { "id": 1, "name": "철수" },
    { "id": 2, "name": "영희" }
  ],
  "heatmap": [
    // 해당 시간에 가능한 사람 수 및 명단 (프론트에서 색상 농도 계산)
    {
      "dt": "2024-05-20T10:00:00",
      "count": 2,
      "members": ["철수", "영희"]
    },
    {
      "dt": "2024-05-20T10:15:00",
      "count": 1,
      "members": ["철수"]
    }
  ]
}
```

### 2.3 참가자 등록/로그인 (Join Event)방에 이름을 등록하고 참여합니다.
- Guest: 이름/비번 입력.
- User: 헤더에 토큰이 있을 경우, 백엔드에서 user_id를 찾아 매핑.
- Method: POST
- URL: /api/events/{event_id}/participants
- Request Body:
```JSON
{
  "name": "길동",
  "password": "1234" // 선택사항 (비회원일 경우 권장)
}
```

Response:
```JSON
{
  "participant_id": 3,
  "token": "eyJhbGciOiJIUzI1..." // 추후 수정 요청 시 식별용 토큰
}
```

### 2.4 내 시간 등록/수정 (Update Availability)
그리드에서 드래그가 끝났을 때(onMouseUp) 또는 '저장' 버튼 클릭 시 호출합니다.
- Method: PUT (또는 POST)
- URL: /api/participants/{participant_id}/availabilityLogic: 해당 participant_id의 기존 데이터를 Delete하고, 요청받은 슬롯들을 Bulk Insert 합니다.
- Request Body:
```JSON
{
  // 내가 선택한(가능한) 모든 시간 슬롯의 배열
  "slots": [
    "2024-05-20T10:00:00",
    "2024-05-20T10:15:00",
    "2024-05-20T14:00:00"
  ]
}
```
- Response: 200 OK

### 2.5 시간표 이미지 업로드 (Upload Timetable) 아직 구체화 미흡. 추후 개발 예정
<!-- 에브리타임 등의 시간표 이미지를 업로드하면 AI가 분석하여 자동으로 가능한 시간을 계산해 반영합니다.
- Method: POST
- URL: /api/events/{event_id}/participants/me/upload-timetableRequest - Header: Content-Type: multipart/form-data
- Request Body:file: (Binary Image File)
- Process Logic:
 - Image Analysis: OCR/Vision API를 통해 이미지에서 수업(불가능한) 시간 추출 (예: 월 10:00~12:00).
 - Reset: 해당 유저의 기존 Availabilities 데이터 초기화.
 - Calculation: (방 전체 시간 범위 - 추출된 수업 시간) = 가능한 시간 도출.
 - Save: 계산된 가능한 시간 슬롯을 Availabilities 테이블에 저장
- Response: 200 OK (성공 시 새로고침된 그리드 데이터 반환) -->


