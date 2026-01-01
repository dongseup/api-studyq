import {
  SmsVerifyResponse,
  TokenResponse,
  LogoutResponse,
} from './types/auth.types';

export interface IAuthRepository {
  /**
   * SMS 인증번호 발송
   * @param phoneNumber 전화번호
   * @returns 성공 응답 또는 에러
   */
  sendSms(phoneNumber: string): Promise<{
    status: string;
    message: string;
  }>;

  /**
   * SMS 인증번호 확인
   * @param phoneNumber 전화번호
   * @param code 인증번호
   * @returns 인증 토큰 및 학생 목록
   */
  verifySms(phoneNumber: string, code: string): Promise<SmsVerifyResponse>;

  /**
   * 인증 토큰을 액세스 토큰으로 교환 (로그인)
   * @param verificationToken 인증 토큰
   * @param sCode 학생 코드
   * @returns 액세스 토큰, 리프레시 토큰 및 학생 정보
   */
  exchangeToken(
    verificationToken: string,
    sCode: string,
  ): Promise<TokenResponse>;

  /**
   * 리프레시 토큰으로 액세스 토큰 갱신
   * @param refreshToken 리프레시 토큰
   * @returns 새로운 액세스 토큰, 리프레시 토큰 및 학생 정보
   */
  refreshToken(refreshToken: string): Promise<TokenResponse>;

  /**
   * 로그아웃
   * @param refreshToken 리프레시 토큰
   * @returns 성공 응답
   */
  logout(refreshToken: string): Promise<LogoutResponse>;
}
