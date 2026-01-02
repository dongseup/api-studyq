import { Inject, Injectable } from '@nestjs/common';
import type { IAuthRepository } from './auth.repository.interface';
import {
  LogoutResponse,
  SmsVerifyResponse,
  TokenResponse,
} from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
  ) {}

  async sendSms(
    phoneNumber: string,
  ): Promise<{ status: string; message: string }> {
    return await this.authRepository.sendSms(phoneNumber);
  }

  async verifySms(
    phoneNumber: string,
    code: string,
  ): Promise<SmsVerifyResponse> {
    return await this.authRepository.verifySms(phoneNumber, code);
  }

  async exchangeToken(
    verificationToken: string,
    sCode: string,
  ): Promise<TokenResponse> {
    return await this.authRepository.exchangeToken(verificationToken, sCode);
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    return await this.authRepository.refreshToken(refreshToken);
  }

  async logout(refreshToken: string): Promise<LogoutResponse> {
    return await this.authRepository.logout(refreshToken);
  }
}
