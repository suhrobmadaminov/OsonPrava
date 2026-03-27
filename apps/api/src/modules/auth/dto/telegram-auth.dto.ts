import { IsString, IsOptional, IsNumberString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TelegramAuthDto {
  @ApiProperty()
  @IsNumberString()
  id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photo_url?: string;

  @ApiProperty()
  @IsString()
  auth_date: string;

  @ApiProperty()
  @IsString()
  hash: string;
}
