import { Children, Student } from '../auth/types/auth.types';

// Mock 학생 목록 데이터
export const mockStudents: Student[] = [
  {
    user_role: 'student',
    user_id: 1,
    name: '홍길동',
    eng_name: 'Brian',
    s_code: 'S2025A00123',
    school: '서울초등학교',
    grade_name: '6학년',
    class_seq: 1,
    device_id: 'device-001',
    device_token: 'fcm-token-001',
    student_photo:
      'https://img.study-q.net/profile/U000000002/S_U000000002_20251106155654_e3b77598_proc.jpg',
    class_year: '2025',
    class_term: '1',
    class_grade: '6',
    class_name: 'A반',
    class_level: 'Level 1',
    class_day: '월수금',
    a_code: 'A001',
    a_name: '서울학원',
    teacher_id: 'T001',
    teacher_name: '김선생',
    teacher_name_eng: 'Kim Teacher',
    teacher_photo: 'https://img.study-q.net/profile/teacher.jpg',
  },
  {
    user_role: 'student',
    user_id: 2,
    name: '김철수',
    eng_name: 'John',
    s_code: 'S2025A00456',
    school: '서울초등학교',
    grade_name: '5학년',
    class_seq: 2,
    device_id: 'device-002',
    device_token: 'fcm-token-002',
    student_photo:
      'https://img.study-q.net/profile/U000000003/S_U000000003_20251106155654_e3b77598_proc.jpg',
    class_year: '2025',
    class_term: '1',
    class_grade: '5',
    class_name: 'B반',
    class_level: 'Level 2',
    class_day: '화목',
    a_code: 'A001',
    a_name: '서울학원',
    teacher_id: 'T002',
    teacher_name: '이선생',
    teacher_name_eng: 'Lee Teacher',
    teacher_photo: 'https://img.study-q.net/profile/teacher2.jpg',
  },
];

// 학생 목록용 간단한 정보 (SMS 인증 후 반환용)
export const mockChildren: Children[] = mockStudents.map((student) => {
  return {
    code: student.s_code,
    name: student.name,
    engName: student.eng_name,
    photo: student.student_photo,
  };
});

// 인증번호 저장소 (전화번호 -> 인증번호)
// 예를 들어, 아래와 같이 저장됩니다:
// '010-1234-5678' -> '940201'
// '010-4321-8765' -> '582312'
export const smsCodeStore = new Map<string, string>();

// Rate limiting 저장소 (전화번호 -> 마지막 발송 시간)
export const smsRateLimitStore = new Map<string, number>();

// Verification token 저장소 (verificationToken -> 전화번호)
export const verificationTokenStore = new Map<string, string>();

// Refresh token 저장소 (refreshToken -> 학생 정보)
export const refreshTokenStore = new Map<string, Student>();

// 인증번호 생성 (Mock: 항상 "123456" 반환)
export const generateSmsCode = (): string => {
  return '123456';
};

// Verification token 생성
export function generateVerificationToken(): string {
  // 현재 시각(Date.now())과 랜덤 문자열(Math.random().toString(36).substring(7))을 조합해,
  // 임의의 verification token을 생성합니다. 예시: verification-1717971644552-j4k2gq
  return `verification-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

// Access token 생성용 페이로드
export function createAccessTokenPayload(student: Student) {
  return {
    sub: student.s_code,
    userId: student.user_id,
    userRole: student.user_role,
    classSeq: student.class_seq,
    s_code: student.s_code,
    a_code: student.a_code,
  };
}

// Refresh token 생성용 페이로드
export function createRefreshTokenPayload(student: Student) {
  return {
    sub: student.s_code,
    userId: student.user_id,
    type: 'refresh',
    s_code: student.s_code,
    a_code: student.a_code,
  };
}
