import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/new-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { TelegramAuthDto } from 'src/user/dto/telegram-auth.dto';

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

}