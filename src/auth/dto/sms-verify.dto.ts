import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class SmsVerifyDto {
  @IsString()
  @IsNotEmpty({ message: '휴대폰 번호는 필수 입력 항목입니다.' })
  @Matches(/^010-\d{4}-\d{4}$/, {
    message: '전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)',
  })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty({ message: '인증번호는 필수 입력 항목입니다.' })
  @Length(6, 6, { message: '인증번호는 6자리여야 합니다.' })
  code: string;
}
