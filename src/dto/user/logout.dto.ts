import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class LogoutDto {
    @ApiProperty({
        description: 'The email of the user',
        example: 'john.doe@example.com',
    })
    @IsEmail()
    email: string
}
