# API StudyQ

NestJS 기반의 학습 관리 시스템 API 서버입니다.

## 📋 목차

- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [환경 변수 설정](#환경-변수-설정)
- [API 엔드포인트](#api-엔드포인트)
- [아키텍처](#아키텍처)
- [개발 가이드](#개발-가이드)

## 🛠 기술 스택

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.7
- **Database**: MySQL (mysql2)
- **Authentication**: JWT (Passport)
- **Validation**: class-validator, class-transformer
- **Code Quality**: ESLint, Prettier

## 📁 프로젝트 구조

```
src/
├── auth/                    # 인증 모듈
│   ├── dto/                 # 데이터 전송 객체
│   │   ├── sms-send.dto.ts
│   │   ├── sms-verify.dto.ts
│   │   ├── exchange.dto.ts
│   │   ├── refresh.dto.ts
│   │   └── logout.dto.ts
│   ├── types/               # 타입 정의
│   │   └── auth.types.ts
│   ├── auth.controller.ts  # 컨트롤러
│   ├── auth.service.ts      # 서비스
│   ├── auth.module.ts       # 모듈
│   ├── auth.repository.interface.ts  # Repository 인터페이스
│   └── auth.repository.mock.ts       # Mock Repository 구현
├── config/                  # 설정 파일
│   └── jwt.config.ts
├── database/               # 데이터베이스 모듈
│   └── database.module.ts
├── mocks/                  # Mock 데이터
│   └── auth.mock.ts
├── scripts/                # 유틸리티 스크립트
│   └── debug-db-connection.ts
├── app.module.ts           # 루트 모듈
├── app.controller.ts       # 루트 컨트롤러
├── app.service.ts          # 루트 서비스
└── main.ts                 # 애플리케이션 진입점
```

## 🚀 시작하기

### 사전 요구사항

- Node.js 18.x 이상
- npm 또는 yarn
- MySQL (선택사항, Mock 모드 사용 시 불필요)

### 설치

```bash
# 의존성 설치
npm install
```

### 실행

```bash
# 개발 모드 (watch 모드)
npm run start:dev

# 프로덕션 빌드
npm run build
npm run start:prod

# 디버그 모드
npm run start:debug
```

### 테스트

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

## ⚙️ 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# 서버 설정
PORT=3000

# 데이터베이스 (선택사항)
DATABASE_URL=mysql://user:password@host:port/database

# JWT 설정
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=3600                    # Access Token 만료 시간 (초)
JWT_REFRESH_SECRET=your-refresh-secret  # 선택사항
JWT_REFRESH_EXPIRES_IN=604800          # Refresh Token 만료 시간 (초, 기본 7일)

# Mock 모드 (데이터베이스 없이 실행)
USE_MOCK=true                           # true로 설정 시 Mock Repository 사용
```

### Mock 모드

데이터베이스 연결 없이 개발하려면 `USE_MOCK=true`로 설정하거나 `DATABASE_URL`을 설정하지 않으면 자동으로 Mock 모드로 실행됩니다.

## 📡 API 엔드포인트

### 인증 (Auth)

#### 1. SMS 인증번호 발송

```http
POST /api/auth/sms/send
Content-Type: application/json

{
  "phoneNumber": "01012345678"
}
```

**응답:**

```json
{
  "status": "success",
  "message": "인증번호가 발송되었습니다."
}
```

**에러 (429 Too Many Requests):**

```json
{
  "status": 429,
  "detail": "너무 빠른 재요청입니다. 30초 후 다시 시도해주세요."
}
```

#### 2. SMS 인증번호 확인

```http
POST /api/auth/sms/verify
Content-Type: application/json

{
  "phoneNumber": "01012345678",
  "code": "123456"
}
```

**응답:**

```json
{
  "status": "success",
  "message": "인증번호가 확인되었습니다.",
  "verificationToken": "verification-token-here",
  "studentCodes": ["S2025A00123", "S2025A00456"],
  "students": [
    {
      "code": "S2025A00123",
      "name": "홍길동",
      "engName": "Brian",
      "photo": "https://..."
    }
  ]
}
```

#### 3. 토큰 교환 (로그인)

```http
POST /api/auth/exchange
Content-Type: application/json

{
  "verificationToken": "verification-token-here",
  "s_code": "S2025A00123"
}
```

**응답:**

```json
{
  "status": "success",
  "message": "ok",
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "expiresIn": 3600,
  "student": {
    "user_id": 1,
    "s_code": "S2025A00123",
    "name": "홍길동",
    ...
  }
}
```

#### 4. 토큰 갱신

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "jwt-refresh-token"
}
```

**응답:** 토큰 교환과 동일한 형식

#### 5. 로그아웃

```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "jwt-refresh-token"
}
```

**응답:**

```json
{
  "status": "success",
  "message": "ok"
}
```

### 기타

#### 데이터베이스 연결 테스트

```http
GET /db
```

## 🏗 아키텍처

이 프로젝트는 **계층형 아키텍처(Layered Architecture)**를 따릅니다:

```
Controller (HTTP 요청/응답 처리)
    ↓
Service (비즈니스 로직)
    ↓
Repository (데이터 접근)
    ↓
Database/External API
```

### 주요 패턴

- **Repository Pattern**: 데이터 접근 로직을 인터페이스로 추상화하여 테스트 용이성과 유연성 확보
- **Dependency Injection**: NestJS의 DI 컨테이너를 활용한 의존성 관리
- **DTO Pattern**: 데이터 검증 및 타입 안전성 보장

### 모듈 구조

- **AuthModule**: 인증 관련 기능 (SMS 인증, JWT 토큰 관리)
- **DatabaseModule**: 데이터베이스 연결 관리 (Global 모듈)
- **ConfigModule**: 환경 변수 관리 (Global 모듈)

## 💻 개발 가이드

### 코드 스타일

- **들여쓰기**: 스페이스 2칸
- **라인 끝**: 자동 (Prettier 설정)
- **따옴표**: 단일 따옴표

### 린팅 및 포맷팅

```bash
# 코드 포맷팅
npm run format

# 린팅
npm run lint
```

### 새로운 기능 추가

1. **Repository 인터페이스 정의** (`auth.repository.interface.ts`)
2. **Mock 구현** (`auth.repository.mock.ts`)
3. **Service 로직 구현** (`auth.service.ts`)
4. **Controller 엔드포인트 추가** (`auth.controller.ts`)
5. **DTO 정의** (`dto/` 디렉토리)

### 테스트 작성

```bash
# 단위 테스트 예시
describe('AuthService', () => {
  it('should send SMS', async () => {
    // 테스트 코드
  });
});
```

## 📚 참고 문서

- [NestJS 공식 문서](https://docs.nestjs.com)
- [API 상세 문서](./backend_doc.md)

## 📝 라이선스

이 프로젝트는 비공개 프로젝트입니다.
