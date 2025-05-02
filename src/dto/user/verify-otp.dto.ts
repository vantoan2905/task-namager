import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The OTP sent to the user',
    example: '123456',
  })
  @IsString()
  otp: string;

  @IsString()
  @ApiProperty({
    description: 'the new password of the user',
    example: 'strong_password_123',
  })
  new_password: string;

  
}