import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsDateString, IsOptional } from 'class-validator';



export class updateTaskDto {
    @ApiProperty({
        description: 'The name of the task',
        example: 'Complete the project documentation',
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'The description of the task',
        example: 'Complete the project documentation',
    })
    @IsString()
    description: string;

    @ApiProperty({
        description: 'The start time of the task in ISO 8601 format',
        example: '2025-04-28T14:30:00Z',
    })
    @IsDateString()
    time_start: string;

    @ApiProperty({
        description: 'The stop time of the task in ISO 8601 format (optional)',
        example: '2025-04-29T17:30:00Z',
    })
    @IsOptional()
    @IsDateString()
    time_stop: string;
}
