# Backend API Documentation

이 문서는 프론트엔드에서 사용하는 API 엔드포인트의 응답 구조를 정리한 문서입니다. NestJS로 API를 새로 구현할 때 참고용으로 작성되었습니다.

## 공통 응답 구조

모든 API는 다음과 같은 공통 응답 구조를 따릅니다:

### 성공 응답
```typescript
{
  status?: string;        // "success" 또는 "error"
  message?: string;       // 응답 메시지
  data?: any;             // 실제 데이터 (엔드포인트별로 다름)
}
```

### 에러 응답
```typescript
{
  status?: string;        // "error"
  message?: string;       // 에러 메시지
  detail?: string;        // 상세 에러 메시지
  error?: string;         // 에러 정보
}
```

### 인증
모든 API는 `Authorization: Bearer {token}` 헤더를 사용합니다. 단, `skipAuth: true`로 표시된 엔드포인트는 인증이 필요하지 않습니다.

---

## 1. 인증 (AUTH)

### 1.1 SMS 인증번호 발송
- **엔드포인트**: `POST /api/auth/sms/send`
- **인증**: 불필요 (`skipAuth: true`)
- **요청 Body**:
```typescript
{
  phoneNumber: string;  // 휴대폰 번호 (예: "01012345678")
}
```
- **응답**:
```typescript
{
  status: string;       // "success"
  message: string;      // "인증번호가 발송되었습니다."
}
```
- **에러 응답** (429 Too Many Requests):
```typescript
{
  status: number;       // 429
  detail: string;       // "너무 빠른 재요청입니다. 30초 후 다시 시도해주세요."
}
```

### 1.2 SMS 인증번호 확인
- **엔드포인트**: `POST /api/auth/sms/verify`
- **인증**: 불필요 (`skipAuth: true`)
- **요청 Body**:
```typescript
{
  phoneNumber: string;  // 휴대폰 번호
  code: string;        // 인증번호
}
```
- **응답**:
```typescript
{
  status: string;
  message: string;
  data: {
    verificationToken: string;  // 인증 토큰 (다음 단계에서 사용)
    students: Children[];       // 학생 목록
  }
}
```
- **Children 타입**:
```typescript
interface Children {
  code: string;        // 학생 코드
  engName: string;     // 영문 이름
  name: string;        // 한글 이름
  photo: string;       // 사진 URL
}
```

### 1.3 토큰 교환 (로그인)
- **엔드포인트**: `POST /api/auth/exchange`
- **인증**: 불필요 (`skipAuth: true`)
- **요청 Body**:
```typescript
{
  verificationToken: string;  // SMS 인증 후 받은 토큰
  s_code: string;            // 선택한 학생 코드
}
```
- **응답**:
```typescript
{
  status: string;
  message: string;
  data: {
    accessToken: string;   // 액세스 토큰
    refreshToken: string;  // 리프레시 토큰
    student: Student;      // 학생 정보
  }
}
```
- **Student 타입**:
```typescript
interface Student {
  a_code: string;
  a_name: string;
  class_day: string;
  class_grade: string;
  class_level: string;
  class_name: string;
  class_seq: number;
  class_term: string;
  class_year: string;
  device_id: string;
  device_token: string;
  eng_name: string;
  grade_name: string;
  name: string;
  s_code: string;
  school: string;
  student_photo: string;
  teacher_id: string;
  teacher_name: string;
  teacher_name_eng: string;
  teacher_photo: string;
  user_id: number;
  user_role: string;
}
```

### 1.4 토큰 갱신
- **엔드포인트**: `POST /api/auth/refresh`
- **인증**: 불필요 (`skipAuth: true`)
- **요청 Body**:
```typescript
{
  refreshToken: string;
}
```
- **응답**: (구현 예정, 현재 사용 예시 없음)
```typescript
{
  status: string;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  }
}
```

---

## 2. 시험 (EXAM)

### 2.1 시험 메인 목록
- **엔드포인트**: `GET /api/exam/main`
- **인증**: 필요
- **응답**:
```typescript
ExamMainItem[]
```
- **ExamMainItem 타입**:
```typescript
interface ExamMainItem {
  order: number;  // 순서 (1, 2, 3, 4)
  code: string;   // 시험 코드 (예: "W", "G", "R", "E", "C", "D")
  name: string;   // 시험 이름
}
```

### 2.2 시험 점수 조회
- **엔드포인트**: `GET /api/exam/scores`
- **인증**: 필요
- **Query Parameters**:
```typescript
{
  e_kind: string;  // 시험 종류 (예: "W", "G", "C")
  year?: number;   // 연도 (선택)
  term?: number;   // 학기 (선택)
}
```
- **응답**:
```typescript
ExamScoresResponse
```
- **ExamScoresResponse 타입**:
```typescript
interface ExamScoresResponse {
  profile: ExamProfile;
  selected_term: ExamTerm;
  terms: ExamTerm[];
  goals: ExamGoal[];
  classes: ExamClass[];
}

interface ExamProfile {
  s_code: string;
  s_name: string;
  academy_code: string;
  academy_name: string;
}

interface ExamTerm {
  year: number;
  term: number;
  label: string;
  value: string;
}

interface ExamGoal {
  kind: string;
  total_score: number;
  obtained_score: number;
  percent: number;
}

interface ExamInfo {
  class_seq: number;
  name: string;
  level: string;
  homeroom: string;
}

interface Exam {
  r_seq: number;
  e_class_seq: number;
  e_kind: string;
  e_date: string;
  book_name: string;
  chapter_name: string;
  r_score: number;
  e_tot_score: number;
  percent: number;
  status: string;        // "PASS", "REPASS", "RETEST", "RESERVE", "WAIT", "NORETEST", "NORESERVE"
  status_text: string;
  r_date: string | null;
  r_time: string;
}

interface ExamClass {
  info: ExamInfo;
  comment: string;
  exams: Exam[];
}
```

### 2.3 시험 설명 조회
- **엔드포인트**: `POST /api/exam/description`
- **인증**: 필요
- **요청 Body**:
```typescript
{
  exam: string;  // 시험 종류 (예: "DT", "AT", "W", "G", "C")
}
```
- **응답**:
```typescript
ExamDescriptionResponse
```
- **ExamDescriptionResponse 타입**:
```typescript
interface ExamDescriptionResponse {
  content: string;  // HTML 또는 텍스트 콘텐츠
  [key: string]: any;  // 추가 필드 가능
}
```

### 2.4 기타 시험 점수 조회
- **엔드포인트**: `GET /api/exam/etc-scores`
- **인증**: 필요
- **Query Parameters**:
```typescript
{
  e_kind: string;  // 시험 종류 (예: "DT", "AT", "R", "E")
  year?: number;   // 연도 (선택)
  term?: number;   // 학기 (선택)
}
```
- **응답**:
```typescript
EtcScoresResponse
```
- **EtcScoresResponse 타입**:
```typescript
interface EtcScoresResponse {
  profile: EtcScoresProfile;
  selected_term: ExamTerm;
  terms: ExamTerm[];
  exams: EtcScoresExam[];
  chart: EtcScoresChartData[];
  records: EtcScoresRecord[];
}

interface EtcScoresProfile {
  s_code: string;
  s_name: string;
  academy_code: string;
  academy_name: string;
  level: string | null;
}

interface EtcScoresConfig {
  config_seq: number;
  year: number;
  term: number;
  e_kind: string;
  exam_name: string;
}

interface EtcScoresItem {
  exam_item_seq: number;
  item_name: string;
  item_subname: string | null;
  full_score: number | null;
  alloc_score: number | null;
  item_score: string;
  item_score_numeric: number;
  item_score_avg?: number;
  percent: number | null;
  children: EtcScoresItem[];  // 중첩 구조 가능
}

interface EtcScoresExam {
  config: EtcScoresConfig;
  items: EtcScoresItem[];
  total_full_score: number;
  total_obtained_score: number;
  percent: number;
  pass: boolean;
  exam_date?: string;
}

interface EtcScoresChartData {
  year: number;
  term: number;
  my: number;    // 내 점수
  avg: number;   // 평균 점수
}

interface EtcScoresRecord {
  exam_name: string;
  year: number;
  term: number;
  score: number;
  grade: string;
}
```

### 2.5 재시험 정보 조회
- **엔드포인트**: `GET /api/exam/retest`
- **인증**: 필요
- **Query Parameters**:
```typescript
{
  class_seq: number;  // 클래스 시퀀스
}
```
- **응답**:
```typescript
RetestResponse
```
- **RetestResponse 타입**:
```typescript
interface RetestResponse {
  class_seq: number;
  today: string;                    // 오늘 날짜 (YYYY-MM-DD)
  available_dates: AvailableDate[];  // 예약 가능한 날짜 목록
  available_times: AvailableTime[];  // 예약 가능한 시간 목록
  has_available: boolean;           // 예약 가능 여부
}

interface AvailableDate {
  date: string;  // 날짜 (YYYY-MM-DD)
}

interface AvailableTime {
  code: string;   // 시간 코드
  label: string;  // 시간 라벨 (예: "09:00", "10:00")
}
```

### 2.6 재시험 예약
- **엔드포인트**: `POST /api/exam/reserve`
- **인증**: 필요
- **요청 Body**:
```typescript
{
  r_seq: number;    // 시험 기록 시퀀스
  r_date: string;   // 예약 날짜 (YYYY-MM-DD)
  r_time: string;   // 예약 시간 코드
}
```
- **응답**:
```typescript
{
  status: string;
  message: string;
}
```

---

## 3. 홈 (HOME)

### 3.1 홈 점수 카드 목록
- **엔드포인트**: `GET /api/home`
- **인증**: 필요
- **응답**:
```typescript
ScoreCard[]
```
- **ScoreCard 타입**:
```typescript
interface ScoreCard {
  no: number;                    // 순서
  code: string;                  // 카드 코드
  subcode: string;               // 서브 코드 (예: "WS", "WR", "GS", "GR", "CS", "CR", "DT", "AT", "RT", "RP", "ML", "SC", "ST", "MT")
  summary: string | null;        // 요약
  name: string;                  // 이름
  title: string;                 // 제목
  date: string | null;           // 날짜
  full_score: number | null;     // 만점
  my_score: number | null;       // 내 점수
  score_title: string | null;    // 점수 제목
  status: string | null;         // 상태
  status_text: string | null;    // 상태 텍스트
  detail: ScoreDetailItem[] | null;           // 상세 정보
  detail_schedule: ScoreScheduleItem[] | null;  // 일정 상세 정보
  detail_corn: ScoreCornItem[] | null;         // CORN 상세 정보
}

interface ScoreDetailItem {
  item: string;   // 항목 이름
  value: string;  // 값
}

interface ScoreScheduleItem {
  cdate: string;  // 날짜
  ctime: string; // 시간
  title: string; // 제목
}

interface ScoreCornItem {
  badge: string;  // 배지 코드
  icon: string;   // 아이콘 코드
  title: string;  // 제목
}
```

---

## 4. 공지사항 (NOTICE)

### 4.1 공지사항 목록
- **엔드포인트**: `GET /api/notice`
- **인증**: 필요
- **Query Parameters**: 없음
- **응답**:
```typescript
NoticeResponse
```
- **NoticeResponse 타입**:
```typescript
interface NoticeResponse {
  status: string;
  message: string;
  items: NoticeItem[];
  nextCursor: number;
  hasMore: boolean;
}

interface NoticeItem {
  seq: number;
  n_title: string;
  n_start: string | null;  // 시작일
  n_end: string | null;    // 종료일
  n_write: string;        // 작성자
  reg_date: string;       // 등록일
}
```

### 4.2 공지사항 상세
- **엔드포인트**: `GET /api/notice/{seq}`
- **인증**: 필요
- **응답**: (구현 예정, 타입 정의만 존재)
```typescript
NoticeDetailResponse
```
- **NoticeDetailResponse 타입**:
```typescript
interface NoticeDetailResponse {
  status: string;
  message: string;
  item: NoticeDetailItem;
}

interface NoticeDetailItem {
  seq: number;
  n_branch: string;
  n_parent_yn: number;
  n_student_yn: number;
  n_title: string;
  n_start: string;
  n_end: string;
  n_contents: string;
  n_write: string;
  reg_date: string;
  mod_date: string;
}
```

---

## 5. 학생 (STUDENT)

### 5.1 학생 사진 업로드
- **엔드포인트**: `POST /api/student/photo`
- **인증**: 필요
- **Content-Type**: `multipart/form-data`
- **요청 Body** (FormData):
```typescript
{
  file?: File;        // 이미지 파일 (선택)
  eng_name?: string;  // 영문 이름 (선택)
}
```
- **응답**:
```typescript
StudentPhotoUploadResponse
```
- **StudentPhotoUploadResponse 타입**:
```typescript
interface StudentPhotoUploadResponse {
  status: string;
  message: string;
  s_code: string;
  photo: string;          // 사진 파일명
  photo_src: string;      // 사진 소스
  photoUrl: string;       // 사진 URL (전체 경로)
  photoSrcUrl: string;    // 사진 소스 URL
  width: number;
  height: number;
}
```

### 5.2 내 정보 조회
- **엔드포인트**: `GET /api/student/my`
- **인증**: 필요
- **Query Parameters**: 없음
- **응답**:
```typescript
MyInfoResponse
```
- **MyInfoResponse 타입**:
```typescript
interface MyInfoResponse {
  myBalance: number;      // 내 CORN 잔액
  myClassTotal: number;   // 반 전체 총합
  history: HistoryItem[]; // 학습 기록
}

interface HistoryItem {
  date: string;           // 날짜
  title: string;          // 제목
  icon: HistoryIcon;      // 아이콘 타입
}

enum HistoryIcon {
  PASS = 'PASS',    // 통과
  FAIL = 'FAIL',    // 실패
  ATTEND = 'ATTEND' // 출석
}
```

### 5.3 학생 레벨 조회
- **엔드포인트**: `POST /api/student/level`
- **인증**: 필요
- **요청 Body**:
```typescript
{
  type: 'T' | 'C';  // 'T': 학습목표, 'C': 과정소개
}
```
- **응답**:
```typescript
ExamDescriptionResponse  // content 필드에 HTML 또는 텍스트 콘텐츠
```

---

## 6. 리워드 (REWARD)

### 6.1 리워드 조회
- **엔드포인트**: `GET /api/reward`
- **인증**: 필요
- **응답**:
```typescript
RewardResponse
```
- **RewardResponse 타입**:
```typescript
interface RewardResponse {
  myBalance: number;           // 내 CORN 잔액
  myClassTotal: number;        // 반 전체 총합
  point_start_date: string;    // 포인트 시작일
  cur_year: string;            // 현재 연도
  cur_term: string;            // 현재 학기
  cur_term_point: number;      // 현재 학기 포인트
  history: RewardHistory[];     // 포인트 히스토리
  badges: RewardBadge[];       // 배지 목록
}

interface RewardHistory {
  year: string;
  term: string;
  point: number;
}

interface RewardBadge {
  badge: string;   // 배지 코드
  icon: string;   // 아이콘 코드
  title: string;  // 배지 제목
}
```

### 6.2 리워드 목록 조회
- **엔드포인트**: `GET /api/reward/list`
- **인증**: 필요
- **Query Parameters**:
```typescript
{
  year: string;   // 연도
  term: string;   // 학기
}
```
- **응답**:
```typescript
RewardListResponse
```
- **RewardListResponse 타입**:
```typescript
interface RewardListResponse {
  year: string;
  term: string;
  myBalance: number;           // 내 CORN 잔액
  myClassTotal: number;        // 반 전체 총합
  items: RewardListItem[];      // 리워드 항목 목록
  badges: RewardBadge[];        // 배지 목록
  nextCursor: number;
  hasMore: boolean;
}

interface RewardListItem {
  seq: number;
  tx_kind: string;    // 거래 종류
  amount: number;    // 포인트 금액
  rule_code: string; // 규칙 코드
  reason: string;    // 사유
}
```

### 6.3 리워드 가이드 조회
- **엔드포인트**: `GET /api/reward/guide`
- **인증**: 필요
- **응답**:
```typescript
RewardGuideResponse
```
- **RewardGuideResponse 타입**:
```typescript
interface RewardGuideResponse {
  items: RewardGuideItem[];
}

interface RewardGuideItem {
  ruleCode: string;  // 규칙 코드
  desc: string;     // 설명
  point: number;    // 포인트
  limit: number;    // 제한 횟수
}
```

---

## 7. 푸시 알림 (PUSH)

### 7.1 푸시 토큰 등록
- **엔드포인트**: `POST /api/push/register`
- **인증**: 필요
- **요청 Body**:
```typescript
{
  deviceId: string;        // 기기 고유 ID
  deviceToken: string;    // FCM 토큰
  platform: string;       // 플랫폼 ("ios" | "android")
  appVersion: string;     // 앱 버전
  userId?: number;        // 사용자 ID (선택)
}
```
- **응답**:
```typescript
{
  status: string;
  message: string;
}
```

### 7.2 푸시 메시지 발송
- **엔드포인트**: `POST /api/push/send`
- **인증**: 필요
- **요청 Body**: (구현 예정, 사용 예시 없음)
- **응답**: (구현 예정)

### 7.3 푸시 메시지 목록 조회
- **엔드포인트**: `GET /api/push/messages`
- **인증**: 필요
- **응답**:
```typescript
PushMessagesResponse
```
- **PushMessagesResponse 타입**:
```typescript
interface PushMessagesResponse {
  status: string;
  message: string;
  items: PushMessageItem[];
  nextCursor: number;
  hasMore: boolean;
}

interface PushMessageItem {
  seq: number;
  title: string;
  body: string;
  push_ok: number;    // 읽음 여부 (0: 안 읽음, 1: 읽음)
  reg_date: string;   // 등록일
  group: string;      // 그룹
}
```

---

## 8. 일정 (SCHEDULE)

### 8.1 일정 목록 조회
- **엔드포인트**: `GET /api/schedule/list`
- **인증**: 필요
- **Query Parameters**:
```typescript
{
  start_month: string;  // 시작 월 (YYYY-MM 형식)
  end_month: string;    // 종료 월 (YYYY-MM 형식)
}
```
- **응답**:
```typescript
{
  status: string;
  message: string;
  items: ScheduleEvent[];
}
```
- **ScheduleEvent 타입**:
```typescript
interface ScheduleEvent {
  id: string | number;
  event_type: string;      // 이벤트 타입 (예: "holiday", "exam", "schedule")
  title: string;           // 제목
  body?: string;           // 본문
  a_code?: string;         // 학원 코드
  class_seq?: number;      // 클래스 시퀀스
  start: string;           // 시작 시간 (ISO 8601: "2025-12-10T14:00:00")
  end?: string;            // 종료 시간
  is_allday?: boolean;     // 종일 여부
  schedule_type?: string;  // 일정 타입
  recur_week?: unknown[];  // 반복 주차
  category?: string;       // 카테고리 (예: "기타")
  exam_seq?: number | null;
  r_place?: string | null;
  r_end?: string | null;
  s_code?: string | null;
  student_name?: string | null;
  seq?: number;            // 시퀀스 (수정/삭제 시 사용)
}
```

### 8.2 일정 등록/수정/삭제
- **엔드포인트**: 
  - 등록: `POST /api/schedule`
  - 수정: `PUT /api/schedule/{seq}`
  - 삭제: `DELETE /api/schedule/{seq}`
- **인증**: 필요
- **요청 Body** (등록/수정):
```typescript
{
  title: string;
  body?: string;
  start: string;        // ISO 8601 형식
  end?: string;
  is_allday?: boolean;
  category?: string;
  // 기타 필드...
}
```
- **응답**:
```typescript
{
  status: string;
  message: string;
}
```

---

## 9. 팝업 (POPUP)

### 9.1 팝업 조회
- **엔드포인트**: `GET /api/popup`
- **인증**: 필요
- **응답**:
```typescript
PopupResponse
```
- **PopupResponse 타입**:
```typescript
interface PopupResponse {
  status: string;
  message: string;
  item: PopupItem | null;  // 팝업이 없으면 null
}

interface PopupItem {
  seq: number;
  title: string;
  html: string;            // HTML 콘텐츠
  link: string;            // 링크 URL
  startDate: string;       // 시작일
  endDate: string;        // 종료일
  studentYn: number;      // 학생 표시 여부 (0: 숨김, 1: 표시)
  parentYn: number;       // 학부모 표시 여부 (0: 숨김, 1: 표시)
}
```

---

## 참고사항

### 날짜 형식
- 대부분의 날짜는 ISO 8601 형식 (`YYYY-MM-DD` 또는 `YYYY-MM-DDTHH:mm:ss`)을 사용합니다.
- 일부 필드에서는 `YYYY.MM.DD` 형식도 사용될 수 있습니다.

### 페이지네이션
- `nextCursor`와 `hasMore` 필드를 사용하여 페이지네이션을 구현합니다.
- 다음 페이지를 조회할 때는 `cursor` 파라미터를 전달합니다.

### 에러 처리
- HTTP 상태 코드와 함께 `status: "error"` 필드를 반환합니다.
- `detail` 또는 `message` 필드에 상세 에러 메시지를 포함합니다.
- 401 Unauthorized 응답 시 클라이언트는 토큰을 제거하고 로그인 화면으로 이동합니다.

### 파일 업로드
- `multipart/form-data` 형식을 사용합니다.
- 이미지 파일은 `file` 필드로 전송합니다.

### 타임아웃
- API 타임아웃은 30초입니다.

---

## NestJS 구현 가이드

### DTO 예시
```typescript
// dto/sms-send.dto.ts
export class SmsSendDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}

// dto/sms-verify.dto.ts
export class SmsVerifyDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
  
  @IsString()
  @IsNotEmpty()
  code: string;
}
```

### Controller 예시
```typescript
@Controller('auth')
export class AuthController {
  @Post('sms/send')
  async sendSms(@Body() dto: SmsSendDto) {
    // 구현
  }
  
  @Post('sms/verify')
  async verifySms(@Body() dto: SmsVerifyDto) {
    // 구현
  }
}
```

### Response DTO 예시
```typescript
export class ApiResponseDto<T> {
  @IsOptional()
  status?: string;
  
  @IsOptional()
  message?: string;
  
  @IsOptional()
  data?: T;
}
```

