import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UserService } from 'src/user/service/user.service';
import { User } from 'src/user/domain/entities/user.entity';
import { TelegramAuthDto } from 'src/user/dto/telegram-auth.dto';
import { CreateUserDto } from 'src/user/dto/new-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // --- ОБЫЧНЫЙ ЛОГИН ---
  async login(loginDto: any) {
    //console.log(loginDto);
    
    const user = await this.validateUser(loginDto);
    return this.generateTokenResponse(user);
  }

  // --- ЛОГИН ЧЕРЕЗ TELEGRAM ---
  async loginWithTelegram(tgData: TelegramAuthDto) {
    // 1. Проверяем хэш (безопасность)
    const isValid = this.verifyTelegramHash(tgData);
    if (!isValid) {
      throw new UnauthorizedException('Invalid Telegram data');
    }

    // 2. Ищем пользователя по telegram_id
    let user = await this.userService.findByTgId(String(tgData.id));

    if (!user) {
      // Опционально: если пользователя нет, можем создать его (авто-регистрация)
      // Или выдать ошибку, если вы хотите сначала только Email-регистрацию
      throw new UnauthorizedException(
        'Аккаунт не привязан к Telegram. Сначала войдите через Email.',
      );
    }

    return this.generateTokenResponse(user);
  }

  // --- ВАЛИДАЦИЯ ХЭША TELEGRAM ---
  private verifyTelegramHash(data: TelegramAuthDto): boolean {
    const { hash, ...userData } = data;
    const botToken = process.env.TELEGRAM_BOT_TOKEN_LOGIN; // Токен вашего бота

    // Сортируем ключи и собираем строку проверки
    const dataCheckString = Object.keys(userData)
      .sort()
      .map((key) => `${key}=${userData[key]}`)
      .join('\n');

    if (!botToken) {
      throw new InternalServerErrorException(
        'Telegram Bot Token is not configured in .env',
      );
    }

    // Создаем секретный ключ
    const secretKey = crypto.createHash('sha256').update(botToken).digest();

    // Вычисляем HMAC-SHA256
    const hmac = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return hmac === hash;
  }

  // Вспомогательный метод для генерации ответа с токеном
  private generateTokenResponse(user: User) {
  const payload = { sub: user.id, email: user.email };
  
  // Извлекаем все поля, кроме пароля, чтобы не отправить его на фронтенд
  const { password, ...userWithoutPassword } = user;

  return {
    access_token: this.jwtService.sign(payload),
    user: userWithoutPassword, // Теперь здесь полноценный объект User
  };
}

  private async validateUser(dto: any): Promise<User> {
    const user = await this.userService.findByEmail(dto.email);

    // Если пользователя нет или у него не задан пароль (зарегистрирован только через ТГ)
    if (!user || !user.password) {
      throw new UnauthorizedException(
        'Неверные учетные данные или пароль не установлен',
      );
    }

    // Теперь TS знает, что user.password — это точно string
    const isPasswordMatching = await bcrypt.compare(
      dto.password,
      user.password,
    );

    if (isPasswordMatching) {
      return user;
    }

    throw new UnauthorizedException('Неверные учетные данные');
  }

  async registration(dto: CreateUserDto) {
    // 1. Проверяем, не занят ли email
    const candidate = await this.userService.findByEmail(dto.email);
    if (candidate) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    try {
      // 2. Хешируем пароль
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      // 3. Создаем пользователя через сервис (Repository)
      const newUser = await this.userService.create({
        ...dto,
        password: hashedPassword,
        role: 'Student', // Роль по умолчанию
      });

      // 4. Сразу выдаем токен, чтобы пользователь не логинился повторно после регистрации
      return this.generateTokenResponse(newUser);
    } catch (error) {
      console.error('Registration error:', error);
      throw new InternalServerErrorException(
        'Ошибка при создании пользователя',
      );
    }
  }
}
