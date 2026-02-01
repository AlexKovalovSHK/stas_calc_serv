import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/service/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Изменяем на Bearer
      ignoreExpiration: false,
      secretOrKey: process.env.PRIVATE_KEY || 'secret_key',
    });
  }

  async validate(payload: any) {
    return this.userService.findById(payload.sub);
  }
}