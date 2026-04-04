import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { IsPasswordStrong } from '../../../common/decorators/is-password-strong.decorator';
import { Match } from '../../../common/decorators/match.decorator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString()
  @IsNotEmpty()
  @IsPasswordStrong()
  password: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString()
  @IsNotEmpty()
  @Match('password', { message: 'Confirm password must match password' })
  confirmPassword: string;
}
