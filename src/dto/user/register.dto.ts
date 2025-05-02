import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
  })
  @IsString()
  @MinLength(4)
  username: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'strong_password_123',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
