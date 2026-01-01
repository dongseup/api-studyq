// 학생 정보 인터페이스
export interface Student {
  user_role: string;
  user_id: number;
  name: string;
  eng_name: string;
  s_code: string;
  school: string;
  grade_name: string;
  class_seq: number;
  device_id: string;
  device_token: string;
  student_photo: string;
  class_year: string;
  class_term: string;
  class_grade: string;
  class_name: string;
  class_level: string;
  class_day: string;
  a_code: string;
  a_name: string;
  teacher_id: string;
  teacher_name: string;
  teacher_name_eng: string;
  teacher_photo: string;
}

// 학생 목록용 간단한 정보 인터페이스
export interface Children {
  code: string;
  name: string;
  engName: string;
  photo: string;
}

// SMS 인증번호 확인 응답 인터페이스
export interface SmsVerifyResponse {
  status: string;
  message: string;
  verificationToken: string;
  studentCodes: string[];
  students: Children[];
}

// 토큰 교환/갱신 응답 인터페이스
export interface TokenResponse {
  status: string;
  message: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  student: Student;
}

// 로그아웃 응답 인터페이스
export interface LogoutResponse {
  status: string;
  message: string;
}
