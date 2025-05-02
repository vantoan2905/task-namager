import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'The new password of the user',
    example: 'new_password_123',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'The confirmation of the new password',
    example: 'new_password_123',
  })
  @IsString()
  @MinLength(6)
  confirmPassword: string;
}