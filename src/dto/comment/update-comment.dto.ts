import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, MaxLength, MinLength } from 'class-validator';
import { Task } from 'src/models/task.model';
import { User } from 'src/models/user.model';

export class UpdateCommentDto {
  @ApiProperty({
    description: 'The ID of the comment',
    example: 1,
  })
  @IsNumber()
  commentid: number;

  @ApiProperty({
    description: 'The messege of the comment',
    example: 'This is a comment',
  })
  @IsString()
  @MinLength(4)
  @MaxLength(500)
  messege: string;

  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'The ID of the task associated with the comment',
    example: 99,
  })
  @IsNumber()
  taskId: number;
}
