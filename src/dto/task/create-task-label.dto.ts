import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsDateString, IsOptional } from 'class-validator';


export class CreateTaskLabelDto {
    @ApiProperty({
        description: 'The label of the task (e.g., 1:bug, 2:feature, 3:improvement)',
        example: '1',
    })
    @IsInt()
    label_id: number

    @ApiProperty({
        description: 'The messege of the comment',
        example: 'This is a comment',
    })
    @IsString()
    messege: string
}