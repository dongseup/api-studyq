import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutDto {
  @IsString()
  @IsNotEmpty({ message: '리프레시토큰은 필수 입력 항목입니다.' })
  refreshToken: string;
}
