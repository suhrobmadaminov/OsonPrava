import { IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnswerDto {
  @ApiProperty()
  @IsInt()
  questionId: number;

  @ApiProperty()
  @IsInt()
  selectedAnswerId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  timeSpentSec?: number;
}
