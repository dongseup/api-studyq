import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IAuthRepository } from './auth.repository.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Pool } from 'mysql2/promise';
import { getRefreshTokenConfig } from 'src/config/jwt.config';
import {
  createAccessTokenPayload,
  createRefreshTokenPayload,
  generateSmsCode,
  generateVerificationToken,
} from 'src/mocks/auth.mock';
import {
  LogoutResponse,
  SmsVerifyResponse,
  TokenResponse,
} from './types/auth.types';
import { Children, Student } from './types/auth.types';

@Injectable()
export class AuthRepositoryDb implements IAuthRepository {
  private readonly refreshJwtService: JwtService;

  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly db: Pool,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // Refresh token용 별도 JwtService 인스턴스 생성
    const refreshConfig = getRefreshTokenConfig(configService);
    this.refreshJwtService = new JwtService(refreshConfig);
  }

  // 메서드들은 나중에 구현
  async sendSms(
    phoneNumber: string,
  ): Promise<{ status: string; message: string }> {
    throw new Error('Not implemented');
  }

  async verifySms(
    phoneNumber: string,
    code: string,
  ): Promise<SmsVerifyResponse> {
    throw new Error('Not implemented');
  }

  async exchangeToken(
    verificationToken: string,
    sCode: string,
  ): Promise<TokenResponse> {
    throw new Error('Not implemented');
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    throw new Error('Not implemented');
  }

  async logout(refreshToken: string): Promise<LogoutResponse> {
    throw new Error('Not implemented');
  }
}
