import { IsEnum, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TestType } from '@prisma/client';

export class StartTestDto {
  @ApiProperty({ enum: TestType })
  @IsEnum(TestType)
  type: TestType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  ticketId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  topicId?: number;
}
