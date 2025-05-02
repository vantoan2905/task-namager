// src/common/dto/response.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: T;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: [String], required: false })
  errors?: string[];

  constructor(partial: Partial<ResponseDto<T>>) {
    Object.assign(this, partial);
  }

  static successResponse<T>(data: T, message = 'Thành công'): ResponseDto<T> {
    return new ResponseDto<T>(
      {
      success: true,
      data,
      message,
      errors: [],
    }

  );
  }

  static errorResponse<T>(message: string, errors: string[] = []): ResponseDto<T> {
    return new ResponseDto<T>({
      success: false,
      data: {} as T,
      message,
      errors,
    });
  }
}
