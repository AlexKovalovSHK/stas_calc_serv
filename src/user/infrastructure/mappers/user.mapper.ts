// infrastructure/mappers/user.mapper.ts

import { User as UserEntity } from '../../domain/entities/user.entity';

export class UserMapper {
  static toDomain(raw: any): UserEntity {
    return new UserEntity({
      id: raw._id.toString(),
      name: raw.name,
      surname: raw.surname,
      email: raw.email,
      password: raw.password,
      role: raw.role,
      phone: raw.phone,
      telegramId: raw.telegram_id,
      telegramUsername: raw.telegram_username,
      avatar: raw.avatar,
    });
  }

  static toPersistence(entity: Partial<UserEntity>) {
    return {
      // Убедитесь, что имена полей СЛЕВА совпадают с именами в @Prop вашей схемы!
      name: entity.name,
      surname: entity.surname,
      email: entity.email,
      password: entity.password,
      role: entity.role || 'Student',
      phone: entity.phone,
      telegram_id: entity.telegramId,
      telegram_username: entity.telegramUsername,
      avatar: entity.avatar,
    };
  }
}