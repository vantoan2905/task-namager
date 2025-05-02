import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'The refresh token of the user',
    example: 'some_refresh_token',
  })
  @IsString()
  refreshToken: string;
}