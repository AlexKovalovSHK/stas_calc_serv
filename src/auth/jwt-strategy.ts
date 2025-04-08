import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
    userMail: string;
    sub: number; // Обычно это id пользователя
  }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private jwtService: JwtService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'yourSecretKey', // Секретный ключ, который вы используете для подписания токена
    });
  }

  async validate(payload: JwtPayload) {
    console.log('JWT Payload:', payload);  // Логируем содержимое токена
    return { userId: payload.sub, userMail: payload.userMail };
  }
}
