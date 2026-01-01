import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SmsSendDto {
  @IsString()
  @IsNotEmpty({ message: '휴대폰 번호는 필수 입력 항목입니다.' })
  @Matches(/^010-\d{4}-\d{4}$/, {
    message: '전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)',
  })
  phoneNumber: string;
}
