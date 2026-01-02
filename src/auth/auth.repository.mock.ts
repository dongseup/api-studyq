import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IAuthRepository } from './auth.repository.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRefreshTokenConfig } from 'src/config/jwt.config';
import {
  createAccessTokenPayload,
  createRefreshTokenPayload,
  generateSmsCode,
  generateVerificationToken,
  mockChildren,
  mockStudents,
  refreshTokenStore,
  smsCodeStore,
  smsRateLimitStore,
  verificationTokenStore,
} from 'src/mocks/auth.mock';
import {
  LogoutResponse,
  SmsVerifyResponse,
  TokenResponse,
} from './types/auth.types';

@Injectable()
// implements 키워드는 클래스가 특정 인터페이스(IAuthRepository)의 규격을 따른다는 것을 의미합니다.
// 즉, 해당 클래스는 IAuthRepository에 정의된 모든 메서드를 반드시 구현해야 합니다.
export class AuthRepositoryMock implements IAuthRepository {
  private readonly refreshJwtService: JwtService;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // Refresh token용 별도 JwtService 인스턴스 생성
    const refreshConfig = getRefreshTokenConfig(configService);

    this.refreshJwtService = new JwtService(refreshConfig);
  }

  async sendSms(
    phoneNumber: string,
  ): Promise<{ status: string; message: string }> {
    // Rate limiting 체크 (30초 제한)
    const lastSendTime = smsRateLimitStore.get(phoneNumber);
    const now = Date.now();
    const RATE_LIMIT_MS = 30 * 1000;

    if (lastSendTime && now - lastSendTime < RATE_LIMIT_MS) {
      throw new HttpException(
        {
          status: 429,
          detail: '너무 빠른 재요청입니다. 30초 후 다시 시도해주세요.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 인증번호 생성 및 저장
    const code = generateSmsCode();
    smsCodeStore.set(phoneNumber, code);
    smsRateLimitStore.set(phoneNumber, now);

    // Mock: 실제로는 SMS 발송 로직이 여기 들어감
    console.log(`[Mock] SMS 발송: ${phoneNumber} -> 인증번호: ${code}`);

    return await Promise.resolve({
      status: 'success',
      message: '인증번호가 발송되었습니다.',
    });
  }

  async verifySms(
    phoneNumber: string,
    code: string,
  ): Promise<SmsVerifyResponse> {
    // 저장된 인증번호 확인
    const storeCode = smsCodeStore.get(phoneNumber);

    if (!storeCode || storeCode !== code) {
      throw new HttpException(
        {
          status: 'error',
          detail: '인증번호가 일치하지 않습니다.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // 인증번호 삭제 (일회용)
    smsCodeStore.delete(phoneNumber);

    // Verification token 생성 및 저장
    const verificationToken = generateVerificationToken();
    verificationTokenStore.set(verificationToken, phoneNumber);

    // 학생 코드 목록 추출
    const studentCodes = mockChildren.map((child) => child.code);

    return await Promise.resolve({
      status: 'success',
      message: '인증번호가 확인되었습니다.',
      verificationToken,
      studentCodes,
      students: mockChildren,
    });
  }

  async exchangeToken(
    verificationToken: string,
    sCode: string,
  ): Promise<TokenResponse> {
    // Verification token 검증
    const phoneNumber = verificationTokenStore.get(verificationToken);
    if (!phoneNumber) {
      throw new HttpException(
        {
          status: 'error',
          detail: '유효하지 않은 인증토큰입니다.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // 학생 정보 찾기
    const student = mockStudents.find((student) => student.s_code === sCode);

    if (!student) {
      throw new HttpException(
        {
          status: 'error',
          detail: '학생을 찾을 수 없습니다.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Access token 생성
    const accessTokenPayload = createAccessTokenPayload(student);
    const accessToken = this.jwtService.sign(accessTokenPayload);

    // 새로운 Refresh token 생성 (토큰 갱신)
    const refreshTokenPayload = createRefreshTokenPayload(student);
    const refreshToken = this.refreshJwtService.sign(refreshTokenPayload);

    // Refresh token 저장
    refreshTokenStore.set(refreshToken, student);

    // Verification token 삭제 (일회용)
    verificationTokenStore.delete(verificationToken);

    const expiresIn = parseInt(
      this.configService.get<string>('JWT_EXPIRES_IN') || '3600',
    );

    return await Promise.resolve({
      status: 'success',
      message: 'ok',
      accessToken,
      refreshToken,
      expiresIn,
      student,
    });
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    // Refresh token 검증
    try {
      this.refreshJwtService.verify(refreshToken);
    } catch (error) {
      console.error('Refresh token 검증 실패:', error);
      throw new HttpException(
        {
          status: 'error',
          detail: '유효하지 않은 리프레시 토큰입니다.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    // 저장된 학생 정보 확인
    const student = refreshTokenStore.get(refreshToken);
    if (!student) {
      throw new HttpException(
        {
          status: 'error',
          message: '리프레시 토큰이 만료되었거나 유효하지 않습니다.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const accessTokenPayload = createAccessTokenPayload(student);
    const accessToken = this.jwtService.sign(accessTokenPayload);

    const newRefreshTokenPayload = createRefreshTokenPayload(student);
    const newRefreshToken = this.refreshJwtService.sign(newRefreshTokenPayload);

    refreshTokenStore.delete(refreshToken);
    refreshTokenStore.set(newRefreshToken, student);

    const expiresIn = parseInt(
      this.configService.get<string>('JWT_EXPIRES_IN') || '3600',
    );

    return await Promise.resolve({
      status: 'success',
      message: 'ok',
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn,
      student,
    });
  }

  async logout(refreshToken: string): Promise<LogoutResponse> {
    refreshTokenStore.delete(refreshToken);
    return await Promise.resolve({
      status: 'success',
      message: 'ok',
    });
  }
}
