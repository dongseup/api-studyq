import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SmsSendDto } from './dto/sms-send.dto';
import { SmsVerifyDto } from './dto/sms-verify.dto';
import { ExchangeDto } from './dto/exchange.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sms/send')
  @HttpCode(HttpStatus.OK)
  async sendSms(@Body() dto: SmsSendDto) {
    try {
      return await this.authService.sendSms(dto.phoneNumber);
    } catch (error: any) {
      if (error.status === 429) {
        throw new HttpException(
          {
            status: error.status,
            message: error.detail,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      throw new HttpException(
        {
          status: 'error',
          message: error.message || 'SMS 발송에 실패했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('sms/verify')
  @HttpCode(HttpStatus.OK)
  async verifySms(@Body() dto: SmsVerifyDto) {
    try {
      return await this.authService.verifySms(dto.phoneNumber, dto.code);
    } catch (error: any) {
      throw new HttpException(
        {
          status: error.status || 'error',
          message: error.message || '인증번호 확인에 실패했습니다.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('exchange')
  @HttpCode(HttpStatus.OK)
  async exchangeToken(@Body() dto: ExchangeDto) {
    try {
      return await this.authService.exchangeToken(
        dto.verificationToken,
        dto.s_code,
      );
    } catch (error: any) {
      throw new HttpException(
        {
          status: error.status || 'error',
          message: error.message || '토큰 교환에 실패했습니다.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshDto) {
    try {
      return await this.authService.refreshToken(dto.refreshToken);
    } catch (error: any) {
      throw new HttpException(
        {
          status: error.status || 'error',
          message: error.message || '토큰 갱신에 실패했습니다.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() dto: LogoutDto) {
    try {
      return await this.authService.logout(dto.refreshToken);
    } catch (error: any) {
      throw new HttpException(
        {
          status: error.status || 'error',
          message: error.message || '로그아웃에 실패했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
