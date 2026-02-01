import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import * as dotenv from "dotenv";
import { UserModule } from "src/user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

dotenv.config();

@Module({
    imports: [
      UserModule,
      JwtModule.register({
        global: true,
        secret: process.env.PRIVATE_KEY || "secret_key",
        signOptions: {
          expiresIn: "48h",
        },
      }),
    ],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [JwtModule],
  })

  export class AuthModule {}