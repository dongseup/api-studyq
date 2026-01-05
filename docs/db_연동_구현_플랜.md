---
name: DB 연동 구현
overview: AuthRepositoryMock을 실제 DB 연동으로 대체하여 인증 기능을 데이터베이스와 연동합니다. 기존 Repository 인터페이스를 유지하면서 AuthRepositoryDb를 구현하고, SMS 인증번호, Verification Token, Refresh Token, 학생 정보를 DB에서 관리하도록 합니다.
todos:
  - id: "1"
    content: "새 파일 생성: src/auth/auth.repository.db.ts - 기본 클래스 구조 작성 (Injectable 데코레이터, IAuthRepository 구현, 생성자에서 DATABASE_CONNECTION과 JwtService, ConfigService 주입)"
    status: pending
  - id: "2"
    content: AuthRepositoryDb에 refreshJwtService 인스턴스 생성 로직 추가 (AuthRepositoryMock과 동일하게 getRefreshTokenConfig 사용)
    status: pending
    dependencies:
      - "1"
  - id: "3"
    content: "sendSms() 메서드 구현: 1) Rate limiting 체크를 위한 SQL 쿼리 작성 (sms_codes 테이블에서 phone_number로 최근 created_at 조회), 2) 30초 제한 로직 구현, 3) 인증번호 생성 (generateSmsCode 함수 사용), 4) DB에 인증번호 저장 (INSERT 또는 UPDATE 쿼리, expires_at은 5분 후로 설정), 5) Rate limiting 정보 업데이트"
    status: pending
    dependencies:
      - "1"
      - "2"
  - id: "4"
    content: "verifySms() 메서드 구현: 1) DB에서 인증번호 조회 (phone_number와 code로 조회, expires_at 체크), 2) 인증번호 일치 여부 확인, 3) 인증번호 삭제 (사용된 인증번호는 삭제), 4) Verification token 생성 (generateVerificationToken 함수 사용), 5) DB에 verification token 저장 (verification_tokens 테이블에 INSERT, expires_at은 10분 후로 설정), 6) 전화번호로 학생 목록 조회 (students 테이블에서 phone_number로 조회), 7) Children 형태로 변환하여 반환"
    status: pending
    dependencies:
      - "1"
      - "2"
  - id: "5"
    content: "exchangeToken() 메서드 구현: 1) DB에서 verification token 조회 및 검증 (expires_at 체크), 2) phone_number 추출, 3) s_code로 학생 정보 조회 (students 테이블에서 JOIN으로 모든 정보 조회), 4) 학생 정보가 없으면 에러 처리, 5) Access token 생성 (createAccessTokenPayload와 jwtService.sign 사용), 6) Refresh token 생성 (createRefreshTokenPayload와 refreshJwtService.sign 사용), 7) DB에 refresh token 저장 (refresh_tokens 테이블에 INSERT), 8) Verification token 삭제, 9) Student 객체 반환"
    status: pending
    dependencies:
      - "1"
      - "2"
  - id: "6"
    content: "refreshToken() 메서드 구현: 1) Refresh token JWT 검증 (refreshJwtService.verify), 2) DB에서 refresh token 조회 (refresh_tokens 테이블에서 token으로 조회, expires_at 체크), 3) 저장된 user_id 또는 s_code로 학생 정보 조회, 4) 새 Access token 생성, 5) 새 Refresh token 생성, 6) 기존 refresh token 삭제, 7) 새 refresh token 저장, 8) Student 객체 반환"
    status: pending
    dependencies:
      - "1"
      - "2"
  - id: "7"
    content: "logout() 메서드 구현: 1) DB에서 refresh token 삭제 (refresh_tokens 테이블에서 DELETE), 2) 성공 응답 반환"
    status: pending
    dependencies:
      - "1"
      - "2"
  - id: "8"
    content: "에러 처리 추가: 각 메서드에서 DB 에러 발생 시 HttpException으로 변환하여 적절한 HTTP 상태 코드와 메시지 반환 (기존 Mock과 동일한 에러 형식 유지)"
    status: pending
    dependencies:
      - "3"
      - "4"
      - "5"
      - "6"
      - "7"
  - id: "9"
    content: "AuthModule 수정: auth.module.ts에서 주석 처리된 AuthRepositoryDb import 추가, repositoryProvider에서 USE_MOCK이 false일 때 AuthRepositoryDb 사용하도록 수정"
    status: pending
    dependencies:
      - "1"
  - id: "10"
    content: "필요한 import 추가: auth.repository.db.ts에 HttpException, HttpStatus, Pool 타입, 그리고 mocks/auth.mock.ts의 유틸리티 함수들 (generateSmsCode, generateVerificationToken, createAccessTokenPayload, createRefreshTokenPayload) import"
    status: pending
    dependencies:
      - "1"
  - id: "11"
    content: "DB 테이블 구조 확인: 실제 DB에 연결하여 students, sms_codes, verification_tokens, refresh_tokens 테이블의 실제 컬럼명과 구조 확인 (DESCRIBE 또는 SHOW CREATE TABLE 사용)"
    status: pending
  - id: "12"
    content: "SQL 쿼리 조정: 확인한 실제 테이블 구조에 맞게 모든 SQL 쿼리의 컬럼명과 테이블명 수정 (phone_number 컬럼명이 다를 수 있음, 예: phone, tel 등)"
    status: pending
    dependencies:
      - "11"
  - id: "13"
    content: "Prepared Statement 사용 확인: 모든 SQL 쿼리가 Prepared Statement를 사용하도록 확인 (mysql2의 query 메서드에 ? 플레이스홀더 사용)"
    status: pending
    dependencies:
      - "3"
      - "4"
      - "5"
      - "6"
      - "7"
  - id: "14"
    content: "토큰 만료 시간 처리: verification_tokens와 refresh_tokens 테이블 조회 시 expires_at과 현재 시간을 비교하여 만료된 토큰은 무시하도록 WHERE 절에 조건 추가"
    status: pending
    dependencies:
      - "4"
      - "5"
      - "6"
  - id: "15"
    content: "테스트: .env에서 USE_MOCK=false로 설정하고 DATABASE_URL이 올바르게 설정되어 있는지 확인, 서버 실행 후 각 API 엔드포인트 테스트 (POST /api/auth/sms/send, POST /api/auth/sms/verify, POST /api/auth/exchange, POST /api/auth/refresh, POST /api/auth/logout)"
    status: pending
    dependencies:
      - "9"
---

# DB 연동 구현 플랜

## 목표

- `AuthRepositoryMock`을 `AuthRepositoryDb`로 대체
- 실제 MySQL 데이터베이스와 연동
- 기존 인터페이스(`IAuthRepository`) 유지
- Mock/DB 전환 가능하도록 설정 유지

## 작업 내용

### 1. AuthRepositoryDb 클래스 생성

**파일**: `src/auth/auth.repository.db.ts`

- `IAuthRepository` 인터페이스 구현
- `DATABASE_CONNECTION` 주입받아 사용
- 다음 메서드 구현:
- `sendSms()`: SMS 인증번호 생성 및 DB 저장, Rate limiting 체크
- `verifySms()`: DB에서 인증번호 확인, Verification token 생성 및 저장
- `exchangeToken()`: Verification token 검증, 학생 정보 조회, Access/Refresh token 생성 및 저장
- `refreshToken()`: Refresh token 검증, 새 토큰 생성 및 교체
- `logout()`: Refresh token 삭제

### 2. 필요한 DB 테이블 구조 확인/가정

실제 DB 테이블 구조에 맞춰 구현하되, 일반적으로 필요한 테이블:

- **students**: 학생 정보 (user_id, s_code, name, eng_name, phone_number 등)
- **sms_codes**: SMS 인증번호 (phone_number, code, created_at, expires_at)
- **verification_tokens**: 인증 토큰 (token, phone_number, created_at, expires_at)
- **refresh_tokens**: 리프레시 토큰 (token, user_id, s_code, created_at, expires_at)

**참고**: 실제 테이블 구조가 다를 경우, 쿼리를 해당 구조에 맞게 수정 필요

### 3. SQL 쿼리 작성

각 메서드별로 필요한 SQL 쿼리:

- SMS 인증번호 저장/조회/삭제
- Rate limiting 체크 (마지막 발송 시간 확인)
- Verification token 저장/조회/삭제
- Refresh token 저장/조회/삭제
- 학생 정보 조회 (전화번호로 학생 목록 조회, s_code로 학생 정보 조회)

### 4. AuthModule 수정

**파일**: `src/auth/auth.module.ts`

- `USE_MOCK` 환경변수에 따라 `AuthRepositoryMock` 또는 `AuthRepositoryDb` 선택
- 주석 처리된 `AuthRepositoryDb` 부분 활성화
- `DATABASE_CONNECTION` 의존성 주입 확인

### 5. 에러 처리 및 트랜잭션

- DB 연결 실패 시 적절한 에러 처리
- 필요한 경우 트랜잭션 처리 (예: 토큰 생성 및 저장)
- SQL 인젝션 방지를 위한 Prepared Statement 사용

### 6. 테스트

- DB 연결 테스트 (`GET /db` 엔드포인트 활용)
- 각 인증 API 엔드포인트 테스트
- Mock 모드와 DB 모드 전환 테스트

## 구현 순서

1. **AuthRepositoryDb 기본 구조 생성** - 클래스 및 의존성 주입 설정
2. **학생 정보 조회 쿼리 구현** - `exchangeToken`, `refreshToken`에서 사용
3. **SMS 인증번호 관리 구현** - `sendSms`, `verifySms` 메서드
4. **토큰 관리 구현** - Verification token, Refresh token 저장/조회/삭제
5. **AuthModule 수정** - Mock/DB 전환 로직 활성화
6. **테스트 및 디버깅** - 실제 DB 연결 테스트

## 주의사항

- 실제 DB 테이블 구조를 확인하고 쿼리를 맞춰야 함
- 기존 Mock과 동일한 응답 형식 유지
- Rate limiting 로직 (30초 제한) 유지
- 토큰 만료 시간 관리 (Verification token, Refresh token)
- SQL 인젝션 방지를 위한 Prepared Statement 필수 사용


