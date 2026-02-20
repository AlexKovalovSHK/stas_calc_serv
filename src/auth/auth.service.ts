import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UserService } from 'src/user/service/user.service';
import { User } from 'src/user/domain/entities/user.entity';
import { TelegramAuthDto } from 'src/user/dto/telegram-auth.dto';
import { CreateUserDto } from 'src/user/dto/new-user.dto';
import { TelegramService } from 'src/telegram/telegram.service';
import { ChangePasswordDto } from 'src/user/dto/change-password.dto';

export interface TelegramCheckDto extends TelegramAuthDto {}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Optional() private telegramService: TelegramService,
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
    const botToken = process.env.TELEGRAM_BOT_TOKEN; // Токен вашего бота

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

  // --- 1. ЗАПРОС КОДА СБРОСА ---
  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('Пользователь с таким Email не найден');
    }

    if (!user.telegramId) {
      throw new BadRequestException(
        'Ваш аккаунт не привязан к Telegram. Пожалуйста, обратитесь в поддержку.',
      );
    }

    // Генерируем 6-значный код
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Сохраняем код в базу пользователю (нужно добавить поля в схему User: resetCode и resetCodeExpires)
    await this.userService.setResetCode(user.id, resetCode);

    // Отправляем код в Телеграм
    try {
      await this.telegramService.sendResetCode(
        String(user.telegramId),
        resetCode,
      );
      return { message: 'Код подтверждения отправлен в ваш Telegram' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Не удалось отправить сообщение в Telegram',
      );
    }
  }

  // --- 2. СБРОС ПАРОЛЯ ПО КОДУ ---
  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.userService.findByEmail(email);

    if (!user || user.resetCode !== code) {
      throw new BadRequestException('Неверный код или Email');
    }

    if (!user.resetCodeExpires) {
      throw new BadRequestException(
        'Запрос на восстановление пароля не найден или недействителен',
      );
    }

    // Проверка срока жизни кода (например, 15 минут)
    const isExpired = new Date() > user.resetCodeExpires;
    if (isExpired) {
      throw new BadRequestException('Срок действия кода истек');
    }

    // Хешируем новый пароль и сохраняем
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.updatePassword(user.id, hashedPassword);

    // Очищаем код сброса
    await this.userService.clearResetCode(user.id);

    return { message: 'Пароль успешно изменен' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
  // 1. Получаем пользователя (включая пароль)
  // ВАЖНО: убедитесь, что ваш репозиторий возвращает пароль
  const user = await this.userService.findById(userId);
  
  if (!user || !user.password) {
    throw new NotFoundException('Пользователь не найден');
  }

  // 2. Проверяем, совпадает ли "старый" пароль с тем, что в базе
  const isPasswordMatching = await bcrypt.compare(
    dto.oldPassword,
    user.password,
  );

  if (!isPasswordMatching) {
    throw new BadRequestException('Старый пароль введен неверно');
  }

  // 3. Хешируем новый пароль
  const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);

  // 4. Сохраняем через UserService
  await this.userService.updatePassword(userId, hashedNewPassword);

  return { message: 'Пароль успешно обновлен' };
}

async linkTelegram(userId: string, tgData: TelegramAuthDto) {
  // 1. Обязательная проверка хэша
  const isValid = this.verifyTelegramHash(tgData);
  if (!isValid) {
    throw new UnauthorizedException('Данные Telegram не прошли проверку (invalid hash)');
  }

  // 2. Проверка: не привязан ли этот Telegram уже к другому аккаунту?
  const existingUser = await this.userService.findByTgId(String(tgData.id));
  if (existingUser && existingUser.id !== userId) {
    throw new ConflictException('Этот Telegram аккаунт уже привязан к другому пользователю');
  }

  // 3. Только после проверок сохраняем ID
  return this.userService.updateTelegramInfo(userId, {
    telegram_id: String(tgData.id),
    telegramUsername: tgData.username,
    avatar: tgData.photo_url
  });
}

}
