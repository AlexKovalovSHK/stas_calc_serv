import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/user/service/user.service';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { CreateUserDto } from 'src/user/dto/new-user.dto';
import { User, UserDocument } from 'src/user/shema/user.shema';
import { HydratedDocument } from 'mongoose';
import { UserWithId } from 'src/user/shema/types';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  private secretKey: string = process.env.PRIVATE_KEY || 'secret_key';

  async login(
    loginUserDto: LoginUserDto,
    @Res() res: Response
  ): Promise<UserWithId | null> {
    try {
      
       const userToken = await this.validateUser(loginUserDto)
  
      // Генерируем JWT-токен
      const token = this.jwtService.sign({
        userId: userToken._id,
        userMail: userToken.email,
      });
      
      // Устанавливаем токен в cookie
      res.cookie('token', token, {
        httpOnly: true,  // Защита от XSS
        secure: false,    // Только HTTPS (убери, если тестируешь локально)
        sameSite: 'strict', // Защита от CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000, // Куки живёт 7 дней
      });
  
  
      const user = await this.userService.getUserByEmail(loginUserDto.email);
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error; // Отправляем 401 Unauthorized на клиент
      }
  
      console.error("Login error:", error);
      throw new InternalServerErrorException("Something went wrong");
    }
  }

  async me(res: any, req: Request): Promise<UserWithId> {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(403).json({ message: 'Problems with token1' });
      }
      const decoded = this.jwtService.decode(token) as { userId: number };

      if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
        return res.status(403).json({ message: 'Problems with token2' });
      }
      const userId = String(decoded.userId);
      const user = await this.userService.getOne(userId);
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: `Error: ${error}` });
    }
  }

  async logout(res: Response) {
    // Сбрасываем cookie с токеном
    res.clearCookie('token'); // Убедитесь, что имя cookie совпадает с тем, что вы используете
    return res
      .status(200)
      .json({ message: 'Sie haben sich erfolgreich abgemeldet' });
  }

  async registration(userDto: CreateUserDto): Promise<string> {
    // Проверка на существование пользователя с таким email
    const candidate = await this.userService.getUserByEmail(userDto.email);
    if (candidate) {
      throw new HttpException(
        'Es existiert ein Benutzer mit dieser E-Mail',
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashPassword = await bcrypt.hash(userDto.password, 5);
    const user = await this.userService.create({
      ...userDto,
      password: hashPassword,
    });
    const token = await this.generateToken(user);

    return token;
  }

  private async generateToken(user: HydratedDocument<User>): Promise<string> {
    const payload = { userMail: user.email, userId: user._id.toString() };
    // Генерация токена и возврат как строка
    return this.jwtService.sign(payload, { secret: this.secretKey });
  }

  private async validateUser(userDto: LoginUserDto): Promise<UserWithId> {
    const user = await this.userService.getUserByEmail(userDto.email); // ✅ lean() уже внутри метода
    if (!user) {
      throw new UnauthorizedException({
        message: 'Falsche E-Mail-Adresse oder falsches Passwort',
      });
    }

    const passwordEquals = await bcrypt.compare(
      userDto.password,
      user.password,
    );
    if (passwordEquals) {
      return user;
    }

    throw new UnauthorizedException({
      message: 'Falsche E-Mail-Adresse oder falsches Passwort',
    });
  }
}
