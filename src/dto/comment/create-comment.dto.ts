import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateCommentDto {
    @ApiProperty({
        description: 'The messege of the comment',
        example: 'This is a comment',
    })
    @IsString()
    @MinLength(4)
    messege: string;

    @ApiProperty({
        description: 'The username author of the comment',
        example: 'john_doe',
    })
    @IsString()
    @MinLength(5)
    username: string;

    @ApiProperty(
        {
            description: 'The task associated with the comment',
            example: '1',
        }
    )
    @IsString()
    @MinLength(1)
    taskId: number
}