import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsDateString, IsOptional } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    description: 'The name of the task',
    example: 'Complete the project documentation',
  })
  @IsString()
  name: string;  // Sửa từ name_task thành name

  @ApiProperty({
    description: 'The type of the task (e.g., 1:EPIC, 2:US, 3:TASK, 4:BUG, 5:SUBTASK)',
    example: '1',
  })
  @IsInt()
  type_id: number;

  @ApiProperty({
    description: 'The status of the task (e.g., 1:New, 2:In Progress, 3:Completed, 4:On Hold)',
    example: '1',
  })
  @IsInt()
  status_id: number;

  @ApiProperty({
    description: 'The priority of the task (e.g., 1:Low, 2:Medium, 3:High)',
    example: '2',
  })
  @IsInt()
  priority_id: number;

  @ApiProperty({
    description: 'The label of the task (e.g., 1:bug, 2:feature, 3:improvement)',
    example: '1',
  })
  @IsInt()
  label_id: number;
  @ApiProperty({
    description: 'The list of labels of the task (e.g., 1:bug, 2:feature, 3:improvement)',
    example: '[1,2,3]',
  })

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
  time_stop?: string;  
}
