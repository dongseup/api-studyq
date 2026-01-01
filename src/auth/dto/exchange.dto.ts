import { IsString, IsNotEmpty } from 'class-validator';

export class ExchangeDto {
  @IsString()
  @IsNotEmpty({ message: '인증토큰은 필수 입력 항목입니다.' })
  verificationToken: string;

  @IsString()
  @IsNotEmpty({ message: '학생코드는 필수 입력 항목입니다.' })
  s_code: string;
}
