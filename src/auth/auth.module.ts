import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport"; // 1. Импортируем PassportModule
import * as dotenv from "dotenv";
import { UserModule } from "src/user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt-strategy";

dotenv.config();

@Module({
    imports: [
      UserModule,
      // Регистрируем PassportModule и указываем стратегию по умолчанию
      PassportModule.register({ defaultStrategy: 'jwt' }), 
      JwtModule.register({
        global: true,
        secret: process.env.PRIVATE_KEY || "secret_key",
        signOptions: {
          expiresIn: "48h",
        },
      }),
    ],
    // 3. ОБЯЗАТЕЛЬНО добавляем JwtStrategy в providers
    providers: [AuthService, JwtStrategy], 
    controllers: [AuthController],
    // Экспортируем всё необходимое для других модулей
    exports: [AuthService, JwtModule, JwtStrategy, PassportModule], 
  })
  export class AuthModule {}