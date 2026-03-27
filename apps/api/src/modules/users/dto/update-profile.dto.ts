import { IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Jasur' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Karimov' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  lastName?: string;

  @ApiPropertyOptional({ example: 'jasur_karimov' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username?: string;
}
