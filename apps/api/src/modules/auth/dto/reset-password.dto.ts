import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsPasswordStrong } from '../../../common/decorators/is-password-strong.decorator';
import { Match } from '../../../common/decorators/match.decorator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'NewStrongPass456' })
  @IsString()
  @IsNotEmpty()
  @IsPasswordStrong()
  newPassword: string;

  @ApiProperty({ example: 'NewStrongPass456' })
  @IsString()
  @IsNotEmpty()
  @Match('newPassword', { message: 'Confirm password must match new password' })
  confirmNewPassword: string;
}
