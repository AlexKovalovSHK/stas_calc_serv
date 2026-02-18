import { Body, Controller, Get, Param, Patch, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/new-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { TelegramAuthDto } from 'src/user/dto/telegram-auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ChangePasswordDto } from 'src/user/dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginUserDto) {
    return this.authService.login(loginDto);
  }

  @Post('telegram')
  async loginWithTelegram(@Body() tgData: TelegramAuthDto) {
    return this.authService.loginWithTelegram(tgData);
  }

  @Post('registration')
  async register(@Body() dto: CreateUserDto) {
    return this.authService.registration(dto);
  }

  // --- 1. ЗАПРОС КОДА СБРОСА (Забыл пароль) ---
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  // --- 2. СБРОС ПАРОЛЯ ПО КОДУ ИЗ ТЕЛЕГРАМ ---
  @Post('reset-password')
  async resetPassword(
    @Body() dto: { email: string; code: string; newPassword: string }
  ) {
    return this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
  }

  // --- 3. СМЕНА ПАРОЛЯ (В личном кабинете) ---
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @Req() req: any, 
    @Body() dto: ChangePasswordDto
  ) {
    // ТАК КАК стратегия вернула объект из базы через findById:
    const userId = req.user.id; 
    
    // Добавьте логи, чтобы убедиться:
    console.log('User from request:', req.user);
    console.log('Extracted ID:', userId);

    if (!userId) {
       throw new UnauthorizedException('ID пользователя не найден в токене');
    }

    return this.authService.changePassword(userId, dto);
  }

}