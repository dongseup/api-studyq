import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const getJwtConfig = (
  configService: ConfigService,
): JwtModuleOptions => {
  const secret =
    configService.get<string>('JWT_SECRET') ||
    'your-secret-key-change-in-production';
  const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '3600'; // 1시간 (초 단위)

  return {
    secret,
    signOptions: {
      expiresIn: Number(expiresIn), // 숫자로 변환 (초 단위)
    },
  };
};

export const getRefreshTokenConfig = (
  configService: ConfigService,
): JwtModuleOptions => {
  const secret =
    configService.get<string>('JWT_REFRESH_SECRET') ||
    configService.get<string>('JWT_SECRET') ||
    'your-refresh-secret-key';
  const expiresIn =
    configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '604800'; // 7일 (초 단위)

  return {
    secret,
    signOptions: {
      expiresIn: Number(expiresIn), // 숫자로 변환 (초 단위)
    },
  };
};
