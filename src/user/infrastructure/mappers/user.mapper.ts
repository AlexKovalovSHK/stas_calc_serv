import { User } from '../../domain/entities/user.entity';

export class UserMapper {
  // Из БД в Домен (то, что пойдет во фронтенд)
  static toDomain(raw: any): User {
    return new User({
      id: raw._id.toString(),
      name: raw.name,
      surname: raw.surname,
      email: raw.email,
      role: raw.role,
      phone: raw.phone,
      avatar: raw.avatar,
      telegramId: raw.telegram_id,
      telegramUsername: raw.telegram_username,
      createdAt: raw.createdAt,
    });
  }

  // Из Домена в БД (то, что сохранится)
  static toPersistence(user: Partial<User>) {
    return {
      name: user.name,
      surname: user.surname,
      email: user.email,
      password: user.password,
      phone: user.phone,
      telegram_id: user.telegramId,
      telegram_username: user.telegramUsername,
      avatar: user.avatar,
    };
  }
}