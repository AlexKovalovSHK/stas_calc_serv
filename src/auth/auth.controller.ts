import { Body, Controller, Get, Param, Post, Req, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Response, Request } from 'express';
import { AuthService } from "./auth.service";
import { CreateUserDto } from "src/user/dto/new-user.dto";
import { LoginUserDto } from "src/user/dto/login-user.dto";
import { UserWithId } from "src/user/shema/types";

@Controller("api/v1/auth")
export class AuthController {
  private publicKey: string;
  constructor(private authService: AuthService) {
    /*this.privateKey = new NodeRSA({ b: 2048 });
    this.privateKey.setOptions({ encryptionScheme: "pkcs1" });
    console.log(
      "Публичный ключ (скопируйте для фронтенда):\n",
      this.privateKey.exportKey("public")
    );*/
  }

  @Post("/login")
  async login(
    @Body() userDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<UserWithId | null>  {
    return await this.authService.login(userDto, response);
   
  }

  @Post("registration")
  async registration(
    @Body() userDto: CreateUserDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<string> {
    const result = await this.authService.registration(userDto);
    return result;
  }

  @Post("/logout")
  async logout(@Res({ passthrough: true }) response: Response) {
    response.cookie("token", "", {
      httpOnly: true,
      //secure: process.env.NODE_ENV === "production",  // Включайте secure только в продакшн
      sameSite: "lax",
      expires: new Date(0),  
    });
    return { message: "Sie haben sich erfolgreich abgemeldet" };
  }

  @Get("me")
  async me(@Res() res: Response, @Req() req: Request): Promise<UserWithId | null>  {
    return this.authService.me(res, req);
  }

}
