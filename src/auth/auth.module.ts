import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from 'src/config/jwt.config';
import { AuthController } from './auth.controller';
import { AuthRepositoryMock } from './auth.repository.mock';
import { AuthService } from './auth.service';

const USE_MOCK = process.env.USE_MOCK === 'true' || !process.env.DATABASE_URL;

const repositoryProvider = USE_MOCK
  ? { provide: 'AUTH_REPOSITORY', useClass: AuthRepositoryMock }
  : { provide: 'AUTH_REPOSITORY', useClass: AuthRepositoryMock };
//   : { provide: 'AUTH_REPOSITORY', useClass: AuthRepositoryDb };

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // Repository Provider 설정 (Mock/DB 선택 가능)
    repositoryProvider,
    // 인터페이스로 주입하기 위한 Provider
    {
      provide: 'IAuthRepository',
      useExisting: 'AUTH_REPOSITORY',
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
