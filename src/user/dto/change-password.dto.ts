// src/user/dto/change-password.dto.ts
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Новый пароль должен быть не менее 6 символов' })
  newPassword: string;
}