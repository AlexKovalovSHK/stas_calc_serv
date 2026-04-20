// infrastructure/mappers/user.mapper.ts

import { User, User as UserEntity } from '../../domain/entities/user.entity';

export class UserMapper {
  static toDomain(raw: any): UserEntity {
    return new UserEntity({
      id: raw._id ? raw._id.toString() : raw.id,
      name: raw.name,
      surname: raw.surname,
      email: raw.email,
      password: raw.password,
      role: Array.isArray(raw.role) ? raw.role : [raw.role || 'Student'],
      phone: raw.phone,
      telegramId: raw.telegram_id,
      telegramUsername: raw.telegram_username,
      avatar: raw.avatar,
      academicInfo: raw.academicInfo,
    });
  }

  static toPersistence(domain: Partial<User>): any {
    const persistence: any = {
      name: domain.name,
      surname: domain.surname,
      email: domain.email,
      password: domain.password,
      role: domain.role,
      phone: domain.phone,
      avatar: domain.avatar,
      // ВАЖНО: Маппим camelCase в snake_case, как в схеме
      telegram_id: domain.telegramId || domain['telegram_id'],
      telegram_username: domain.telegramUsername || domain['telegram_username'],
    };

    if (domain.academicInfo) {
      persistence.academicInfo = domain.academicInfo;
    }

    return persistence;
  }
}